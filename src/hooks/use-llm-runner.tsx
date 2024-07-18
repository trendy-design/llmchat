import { useToast } from "@/components/ui";
import { defaultPreferences } from "@/config";
import { useChatContext, usePreferenceContext } from "@/context";
import { constructPrompt } from "@/helper/promptUtil";
import { sortMessages } from "@/lib/helper";
import { modelService } from "@/services/models";
import { messagesService, sessionsService } from "@/services/sessions/client";
import { useChatSessionQueries } from "@/services/sessions/queries";
import { TLLMRunConfig } from "@/types";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { LLMResult } from "@langchain/core/outputs";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import moment from "moment";
import { v4 } from "uuid";
import { useModelList, useTools } from ".";

export const useLLMRunner = () => {
  const { store } = useChatContext();
  const setIsGenerating = store((state) => state.setIsGenerating);
  const setCurrentMessage = store((state) => state.setCurrentMessage);
  const updateCurrentMessage = store((state) => state.updateCurrentMessage);
  const addTool = store((state) => state.addTool);
  const resetState = store((state) => state.resetState);
  const setAbortController = store((state) => state.setAbortController);
  const { getAssistantByKey, getModelByKey } = useModelList();
  const { preferences, apiKeys, updatePreferences } = usePreferenceContext();
  const { getToolByKey } = useTools();
  const { toast } = useToast();
  const { updateSessionMutation } = useChatSessionQueries();

  const invokeModel = async (config: TLLMRunConfig) => {
    resetState();
    setIsGenerating(true);
    const currentAbortController = new AbortController();
    setAbortController(currentAbortController);
    const { sessionId, messageId, input, context, image, assistant } = config;
    const newMessageId = messageId || v4();
    const modelKey = assistant.baseModel;
    const session = await sessionsService.getSessionById(sessionId);
    const messages = await messagesService.getMessages(sessionId);

    const allPreviousMessages =
      messages?.filter((m) => m.id !== messageId) || [];
    const chatHistory = sortMessages(allPreviousMessages, "createdAt");
    const plugins = preferences.defaultPlugins || [];
    const messageLimit =
      preferences.messageLimit || defaultPreferences.messageLimit;

    setCurrentMessage({
      runConfig: config,
      id: newMessageId,
      parentId: sessionId,
      sessionId,
      rawHuman: input,
      createdAt: moment().toISOString(),
      isLoading: true,
    });

    const selectedModelKey = getModelByKey(modelKey);
    if (!selectedModelKey) {
      throw new Error("Model not found");
    }

    const apiKey = apiKeys[selectedModelKey?.baseModel];

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
      systemPrompt: assistant.systemPrompt,
    });

    const availableTools =
      selectedModelKey?.plugins
        ?.filter((p) => plugins.includes(p))
        ?.map((p) =>
          getToolByKey(p)?.tool({
            updatePreferences,
            preferences,
            apiKeys,
            sendToolResponse: addTool,
          })
        )
        ?.filter((t): t is any => !!t) || [];

    const selectedModel = await modelService.createInstance({
      model: selectedModelKey,
      preferences,
      apiKey,
    });

    const previousAllowedChatHistory = chatHistory
      .slice(0, messageLimit)
      .reduce((acc: (HumanMessage | AIMessage)[], { rawAI, rawHuman }) => {
        if (rawAI && rawHuman) {
          return [...acc, new HumanMessage(rawHuman), new AIMessage(rawAI)];
        } else {
          return acc;
        }
      }, []);

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
      }) as any
    );

    let streamedMessage = "";

    const executor =
      availableTools?.length && agentExecutor
        ? agentExecutor
        : chainWithoutTools;

    try {
      const stream: any = await executor.invoke(
        {
          chat_history: previousAllowedChatHistory || [],
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
                name
              ) {
                console.log(
                  "handleToolStart",
                  tool,
                  input,
                  runId,
                  parentRunId,
                  tags,
                  metadata,
                  name
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
        }
      );

      updateCurrentMessage({
        rawHuman: input,
        rawAI: stream?.content || stream?.output,
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

  const generateTitleForSession = async (sessionId: string) => {
    const session = await sessionsService.getSessionById(sessionId);
    const messages = await messagesService.getMessages(sessionId);
    const assistant = getAssistantByKey(preferences.defaultAssistant);
    if (!assistant) {
      return;
    }

    const apiKey = apiKeys[assistant.model.baseModel];

    const selectedModel = await modelService.createInstance({
      model: assistant.model,
      preferences,
      apiKey,
    });

    const firstMessage = messages?.[0];

    if (
      !firstMessage ||
      !firstMessage.rawAI ||
      !firstMessage.rawHuman ||
      messages?.length > 2
    ) {
      return;
    }

    const template = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("message"),
      [
        "user",
        "Make this prompt clear and consise? You must strictly answer with only the title, no other text is allowed.\n\nAnswer in English.",
      ],
    ]);

    try {
      const prompt = await template.formatMessages({
        message: [new HumanMessage(firstMessage.rawHuman)],
      });

      const generation = await selectedModel.invoke(prompt, {});

      const newTitle =
        generation?.content?.toString() || session?.title || "Untitled";
      await updateSessionMutation.mutate({
        sessionId,
        session: newTitle
          ? { title: newTitle, updatedAt: moment().toISOString() }
          : {},
      });
    } catch (e) {
      console.error(e);
      return firstMessage.rawHuman;
    }
  };

  return {
    invokeModel,
    generateTitleForSession,
  };
};
