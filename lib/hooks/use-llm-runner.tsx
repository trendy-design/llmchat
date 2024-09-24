import { useToast } from "@/components/ui";
import { defaultPreferences } from "@/config";
import { useAuth, useChatContext, usePreferenceContext } from "@/lib/context";
import { modelService } from "@/lib/services/models";
import {
  messagesService,
  sessionsService,
} from "@/lib/services/sessions/client";
import { TLLMRunConfig, TProvider, TStopReason } from "@/lib/types";
import { injectPresetValues } from "@/lib/utils/preset-prompt-values";
import {
  constructMessagePrompt,
  constructPrompt,
} from "@/lib/utils/promptUtil";
import { generateShortUUID } from "@/lib/utils/utils";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import moment from "moment";
import { useAssistantUtils, useTools } from ".";
import { useRootContext } from "../context/root";
import { preferencesService } from "../services/preferences";
import plausible from "../utils/plausible";

const getErrorMessage = (error: string) => {
  if (error.includes("image_url") && error.includes("400")) {
    return "This model does not support images";
  }
  if (error.includes("429")) {
    return "Exceeded daily limit or API is running out of credits.";
  }
  return undefined;
};

export const useLLMRunner = () => {
  const { user, open: openSignIn } = useAuth();
  const { store, refetch } = useChatContext();
  const editor = store((state) => state.editor);
  const setIsGenerating = store((state) => state.setIsGenerating);
  const setCurrentMessage = store((state) => state.setCurrentMessage);
  const updateCurrentMessage = store((state) => state.updateCurrentMessage);
  const addTool = store((state) => state.addTool);
  const resetState = store((state) => state.resetState);
  const setAbortController = store((state) => state.setAbortController);
  const { getModelByKey } = useAssistantUtils();
  const { preferences } = usePreferenceContext();
  const { getAvailableTools } = useTools();
  const { toast } = useToast();
  const { setApiKeyModalProvider, setOpenApiKeyModal } = useRootContext();

  const invokeModel = async (config: TLLMRunConfig) => {
    if (!user && config.assistant.baseModel === "llmchat") {
      openSignIn();
      return;
    }
    plausible.trackEvent("Generate", {
      props: {
        model: config.assistant.baseModel,
      },
    });

    //to avoid duplication not refetch when regenerating
    if (!config?.messageId) {
      refetch();
    }
    resetState();

    const currentAbortController = new AbortController();
    setAbortController(currentAbortController);
    const { sessionId, messageId, input, context, image, assistant } = config;
    const newMessageId = messageId || generateShortUUID();
    const modelKey = assistant.baseModel;
    const session = await sessionsService.getSessionById(sessionId);

    if (!session) {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Session not found",
        variant: "destructive",
      });
      return;
    }
    const messages = await messagesService.getMessages(sessionId);

    const allPreviousMessages =
      messages?.filter((m) => m.id !== messageId) || [];
    const messageLimit =
      preferences.messageLimit || defaultPreferences.messageLimit;

    const selectedModelKey = getModelByKey(
      modelKey,
      assistant.provider as TProvider,
    );
    if (!selectedModelKey) {
      throw new Error("Model not found");
    }

    const apiKey = await preferencesService.getApiKey(
      selectedModelKey.provider,
    );
    if (
      !apiKey?.key &&
      !["ollama", "llmchat"].includes(selectedModelKey?.provider)
    ) {
      setIsGenerating(false);
      setApiKeyModalProvider(selectedModelKey?.provider);
      setOpenApiKeyModal(true);
      return;
    }
    editor?.commands.clearContent();
    setIsGenerating(true);

    setCurrentMessage({
      runConfig: config,
      id: newMessageId,
      parentId: sessionId,
      sessionId,
      rawHuman: input || null,
      stop: false,
      stopReason: null,
      rawAI: null,
      image: image || null,
      tools: [],
      relatedQuestions: [],
      createdAt: moment().toDate(),
      isLoading: true,
      errorMessage: null,
    });

    const prompt = await constructPrompt({
      context,
      image,
      memories: preferences.memories,
      hasMessages: allPreviousMessages.length > 0,
      systemPrompt:
        session.customAssistant?.systemPrompt ||
        injectPresetValues(assistant.systemPrompt),
    });

    const availableTools = getAvailableTools(selectedModelKey);

    const selectedModel = await modelService.createInstance({
      model: selectedModelKey,
      preferences,
      provider: selectedModelKey.provider,
      apiKey: apiKey?.key,
    });

    let agentExecutor: AgentExecutor | undefined;

    const modifiedModel = Object.create(Object.getPrototypeOf(selectedModel));
    Object.assign(modifiedModel, selectedModel);

    modifiedModel.bindTools = (tools: any[], options: any) => {
      return selectedModel?.bindTools?.(tools, {
        ...options,
        recursionLimit: 5,
        signal: currentAbortController?.signal,
      });
    };

    if (availableTools?.length) {
      const agentWithTool = await createToolCallingAgent({
        llm: modifiedModel as any,
        tools: availableTools,
        prompt: prompt as any,
        streamRunnable: true,
      });

      agentExecutor = new AgentExecutor({
        agent: agentWithTool as any,
        tools: availableTools,
        maxIterations: 5,
      });
    }
    const chainWithoutTools = prompt.pipe(
      selectedModel.bind({
        signal: currentAbortController?.signal,
      }) as any,
    );

    let streamedMessage = "";

    const executor =
      availableTools?.length && agentExecutor
        ? agentExecutor
        : chainWithoutTools;

    const chatHistory = await constructMessagePrompt({
      messages: allPreviousMessages,
      limit: messageLimit,
    });

    try {
      const stream: any = await executor.invoke(
        {
          chat_history: chatHistory || [],
          context,
          input,
        },
        {
          maxConcurrency: 1,
          recursionLimit: 3,
          callbacks: [
            {
              handleLLMStart: async () => {},
              handleToolStart(
                tool,
                input,
                runId,
                parentRunId,
                tags,
                metadata,
                name,
              ) {
                name && addTool({ toolName: name, isLoading: true });
              },

              handleLLMNewToken: async (token: string) => {
                streamedMessage += token;
                updateCurrentMessage({
                  isLoading: true,
                  rawAI: streamedMessage,
                  stop: false,
                  stopReason: undefined,
                });
              },
              handleLLMError: async (err: Error) => {
                // Log this error
                if (!currentAbortController?.signal.aborted) {
                  toast({
                    title: "Error",
                    description: "Something went wrong",
                    variant: "destructive",
                  });
                }

                const hasError: Record<string, boolean> = {
                  cancel: currentAbortController?.signal.aborted,
                  rateLimit:
                    err.message.includes("429") &&
                    err.message.includes("llmchat"),
                  unauthorized: err.message.includes("401"),
                };

                const stopReason = Object.keys(hasError).find(
                  (value) => hasError[value],
                ) as TStopReason;

                updateCurrentMessage({
                  isLoading: false,
                  rawHuman: input,
                  rawAI: streamedMessage,
                  stop: true,
                  errorMessage: getErrorMessage(err.message),
                  stopReason: stopReason || "error",
                });
              },
            },
          ],
        },
      );

      console.log("stream", stream);

      updateCurrentMessage({
        rawHuman: input,
        rawAI: stream?.content || stream?.output?.[0]?.text || stream?.output,
        isLoading: false,
        image,
        stop: true,
        stopReason: "finish",
      });
    } catch (err) {
      updateCurrentMessage({
        isLoading: false,
        stop: true,
      });
      console.error(err);
    }
  };

  return {
    invokeModel,
  };
};
