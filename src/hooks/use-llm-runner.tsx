import { useToast } from "@/components/ui";
import { defaultPreferences } from "@/config";
import { useChatContext, usePreferenceContext } from "@/context";
import { injectPresetValues } from "@/helper/preset-prompt-values";
import { constructMessagePrompt, constructPrompt } from "@/helper/promptUtil";
import { generateShortUUID } from "@/helper/utils";
import { modelService } from "@/services/models";
import { messagesService, sessionsService } from "@/services/sessions/client";
import { TLLMRunConfig } from "@/types";
import { LLMResult } from "@langchain/core/outputs";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import moment from "moment";
import { useAssistantUtils, useTools } from ".";

export const useLLMRunner = () => {
  const { store } = useChatContext();
  const setIsGenerating = store((state) => state.setIsGenerating);
  const setCurrentMessage = store((state) => state.setCurrentMessage);
  const updateCurrentMessage = store((state) => state.updateCurrentMessage);
  const addTool = store((state) => state.addTool);
  const resetState = store((state) => state.resetState);
  const setAbortController = store((state) => state.setAbortController);
  const { getModelByKey } = useAssistantUtils();
  const { preferences, apiKeys, updatePreferences } = usePreferenceContext();
  const { getToolByKey } = useTools();
  const { toast } = useToast();

  const invokeModel = async (config: TLLMRunConfig) => {
    resetState();
    setIsGenerating(true);
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
    const plugins = preferences.defaultPlugins || [];
    const messageLimit =
      preferences.messageLimit || defaultPreferences.messageLimit;

    setCurrentMessage({
      runConfig: config,
      id: newMessageId,
      parentId: sessionId,
      sessionId,
      rawHuman: input,
      relatedQuestions: [],
      createdAt: moment().toISOString(),
      isLoading: true,
    });

    const selectedModelKey = getModelByKey(modelKey);
    if (!selectedModelKey) {
      throw new Error("Model not found");
    }

    const apiKey = apiKeys[selectedModelKey?.provider];

    if (!apiKey) {
      updateCurrentMessage({
        isLoading: false,
        stop: true,
        stopReason: "apikey",
      });
      return;
    }

    const prompt = await constructPrompt({
      context,
      image,
      memories: preferences.memories,
      hasMessages: allPreviousMessages.length > 0,
      systemPrompt: injectPresetValues(assistant.systemPrompt),
    });

    const availableTools =
      selectedModelKey?.plugins
        ?.filter((p) => plugins.includes(p))
        ?.map((p) =>
          getToolByKey(p)?.tool({
            updatePreferences,
            preferences,
            model: selectedModelKey,
            apiKeys,
            sendToolResponse: addTool,
          }),
        )
        ?.filter((t): t is any => !!t) || [];

    const selectedModel = await modelService.createInstance({
      model: selectedModelKey,
      preferences,
      provider: selectedModelKey.provider,
      apiKey,
    });

    let agentExecutor: AgentExecutor | undefined;

    const modifiedModel = Object.create(Object.getPrototypeOf(selectedModel));
    Object.assign(modifiedModel, selectedModel);

    modifiedModel.bindTools = (tools: any[], options: any) => {
      return selectedModel?.bindTools?.(tools, {
        ...options,
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
                console.log(
                  "handleToolStart",
                  tool,
                  input,
                  runId,
                  parentRunId,
                  tags,
                  metadata,
                  name,
                );

                console.log("handleToolStart", name);
                name && addTool({ toolName: name, toolLoading: true });
              },
              handleToolError: () => {},
              handleToolEnd: () => {},
              handleLLMEnd: async (output: LLMResult) => {
                console.log("handleLLMEnd", output);
              },
              handleLLMNewToken: async (token: string) => {
                streamedMessage += token;

                console.log("handleLLMNewToken", token);
                updateCurrentMessage({
                  isLoading: true,
                  rawAI: streamedMessage,
                  stop: false,
                  stopReason: undefined,
                });
              },
              handleChainEnd: async () => {},
              handleLLMError: async (err: Error) => {
                console.info("handleLLMError", err);
                if (!currentAbortController?.signal.aborted) {
                  toast({
                    title: "Error",
                    description: "Something went wrong",
                    variant: "destructive",
                  });
                }

                updateCurrentMessage({
                  isLoading: false,
                  rawHuman: input,
                  rawAI: streamedMessage,
                  stop: true,
                  stopReason: currentAbortController?.signal.aborted
                    ? "cancel"
                    : "error",
                });
              },
            },
          ],
        },
      );

      console.log(stream);

      updateCurrentMessage({
        rawHuman: input,
        rawAI: stream?.content || stream?.output?.[0]?.text || stream?.output,
        isLoading: false,
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
