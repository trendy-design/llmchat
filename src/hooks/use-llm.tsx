import { useToast } from "@/components/ui/use-toast";
import { usePreferenceContext } from "@/context/preferences";
import { useSessionsContext } from "@/context/sessions";
import { sortMessages } from "@/lib/helper";
import type { Serialized } from "@langchain/core/load/serializable";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { LLMResult } from "@langchain/core/outputs";
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import moment from "moment";
import { useState } from "react";
import { v4 } from "uuid";
import { TAssistant, TChatMessage, TLLMInputProps } from "./use-chat-session";
import { useModelList } from "./use-model-list";
import { defaultPreferences } from "./use-preferences";
import { useTools } from "./use-tools";

export type TUseLLM = {
  onChange?: (props: TChatMessage) => void;
  onFinish?: () => void;
};

export const useLLM = ({ onChange, onFinish }: TUseLLM) => {
  const { addMessageToSession, getSessionById, updateSessionMutation } =
    useSessionsContext();
  const { apiKeys, preferences } = usePreferenceContext();
  const { createInstance, getModelByKey, getAssistantByKey } = useModelList();
  const { toast } = useToast();
  const { getToolByKey } = useTools();

  const [abortController, setAbortController] = useState<AbortController>();

  const stopGeneration = () => {
    abortController?.abort("cancel");
  };

  const preparePrompt = async ({
    context,
    image,
    history,
    assistant,
  }: {
    context?: string;
    image?: string;
    history: TChatMessage[];
    assistant: TAssistant;
  }) => {
    const hasPreviousMessages = history?.length > 0;
    const systemPrompt = assistant.systemPrompt;

    const system: BaseMessagePromptTemplateLike = [
      "system",
      `${systemPrompt} ${
        hasPreviousMessages
          ? `You can also refer to these previous conversations`
          : ``
      }`,
    ];

    const messageHolders = new MessagesPlaceholder("chat_history");

    const userContent = `{input}\n\n${
      context
        ? `Answer user's question based on the following context: """{context}"""`
        : ``
    } `;

    const user: BaseMessagePromptTemplateLike = [
      "user",
      image
        ? [
            {
              type: "text",
              content: userContent,
            },
            {
              type: "image_url",
              image_url: image,
            },
          ]
        : userContent,
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      system,
      messageHolders,
      user,
      ["placeholder", "{agent_scratchpad}"],
    ]);

    return prompt;
  };

  const runModel = async (props: TLLMInputProps) => {
    const { sessionId, messageId, input, context, image, assistant } = props;
    const currentAbortController = new AbortController();
    setAbortController(currentAbortController);

    const selectedSession = await getSessionById(sessionId);

    if (!input) {
      return;
    }

    const newMessageId = messageId || v4();
    const modelKey = assistant.baseModel;

    const allPreviousMessages =
      selectedSession?.messages?.filter((m) => m.id !== messageId) || [];
    const chatHistory = sortMessages(allPreviousMessages, "createdAt");
    const plugins = preferences.defaultPlugins || [];

    const messageLimit =
      preferences.messageLimit || defaultPreferences.messageLimit;

    const defaultChangeProps: TChatMessage = {
      inputProps: props,
      id: newMessageId,
      sessionId,
      rawHuman: input,
      createdAt: moment().toISOString(),
    };

    onChange?.({
      ...defaultChangeProps,
      isLoading: true,
    });
    const selectedModelKey = getModelByKey(modelKey);
    if (!selectedModelKey) {
      throw new Error("Model not found");
    }

    const apiKey = apiKeys[selectedModelKey?.baseModel];

    if (!apiKey) {
      onChange?.({
        ...defaultChangeProps,
        isLoading: false,
        stop: true,
        stopReason: "apikey",
      });
      return;
    }

    const prompt = await preparePrompt({
      context: context,
      image,
      history:
        selectedSession?.messages?.filter((m) => m.id !== messageId) || [],
      assistant,
    });

    const availableTools =
      selectedModelKey?.plugins
        ?.filter((p) => {
          return plugins.includes(p);
        })
        ?.map((p) =>
          getToolByKey(p)?.tool({
            preferences,
            apiKeys,
            toolResponse: (arg) => {
              console.log("toolMeta", arg, onChange);
              onChange?.({
                ...defaultChangeProps,
                toolMeta: arg,
              });
            },
          })
        )
        ?.filter((t): t is any => !!t) || [];

    const selectedModel = await createInstance(selectedModelKey, apiKey);

    const previousAllowedChatHistory = chatHistory
      .slice(0, messageLimit)
      .reduce(
        (acc: (HumanMessage | AIMessage)[], { rawAI, rawHuman, image }) => {
          if (rawAI && rawHuman) {
            return [...acc, new HumanMessage(rawHuman), new AIMessage(rawAI)];
          } else {
            return [...acc];
          }
        },
        []
      );

    let agentExecutor: AgentExecutor | undefined;

    // Creating a copy of the model
    const modifiedModel = Object.create(Object.getPrototypeOf(selectedModel));

    Object.assign(modifiedModel, selectedModel);

    modifiedModel.bindTools = (tools: any[], options: any) => {
      return selectedModel.bindTools?.(tools, {
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
    let toolName: string | undefined;

    const executor =
      !!availableTools?.length && agentExecutor
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
              handleLLMStart: async (llm: Serialized, prompts: string[]) => {
                console.log("handleLLMStart", llm);
                onChange?.({
                  ...defaultChangeProps,
                  rawAI: streamedMessage,
                  isLoading: true,
                  isToolRunning: false,
                  toolName,
                  stop: false,
                  stopReason: undefined,
                  createdAt: moment().toISOString(),
                });
              },

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

                toolName = name;
                onChange?.({
                  ...defaultChangeProps,
                  toolName: name,
                  isToolRunning: true,
                });
              },
              handleToolEnd(output, runId, parentRunId, tags) {
                console.log("handleToolEnd", output, runId, parentRunId, tags);

                onChange?.({
                  ...defaultChangeProps,
                  isToolRunning: false,
                });
              },

              handleLLMEnd: async (output: LLMResult) => {
                console.log("handleLLMEnd", output);
              },
              handleLLMNewToken: async (token: string) => {
                streamedMessage += token;
                onChange?.({
                  ...defaultChangeProps,
                  isLoading: true,
                  rawAI: streamedMessage,
                  toolName,

                  stop: false,
                  stopReason: undefined,
                });
              },
              handleChainEnd: async (output: any) => {},
              handleLLMError: async (err: Error) => {
                console.error("handleLLMError", err);
                if (!currentAbortController?.signal.aborted) {
                  toast({
                    title: "Error",
                    description: "Something went wrong",
                    variant: "destructive",
                  });
                }

                const chatMessage: TChatMessage = {
                  ...defaultChangeProps,
                  isLoading: false,
                  rawHuman: input,
                  toolName,
                  isToolRunning: false,
                  rawAI: streamedMessage,
                  stop: true,
                  stopReason: currentAbortController?.signal.aborted
                    ? "cancel"
                    : "error",
                };
                if (!!streamedMessage?.length) {
                  await addMessageToSession(sessionId, chatMessage);
                }
                onChange?.(chatMessage);
                onFinish?.();
              },
            },
          ],
        }
      );

      // abortController.signal.addEventListener(
      //   "abort",
      //   () => {
      //     console.log("abort", stream);
      //     void stream?.cancel?.("abort");
      //   },
      //   {
      //     once: true,
      //   }
      // );

      const chatMessage: TChatMessage = {
        ...defaultChangeProps,
        rawHuman: input,
        rawAI: stream?.content || stream?.output,
        isToolRunning: false,
        toolName,
        isLoading: false,
        stop: false,
        stopReason: undefined,
        createdAt: moment().toISOString(),
      };

      await addMessageToSession(sessionId, chatMessage);
      await generateTitleForSession(sessionId);
      await onChange?.(chatMessage);
      onFinish?.();
    } catch (err) {
      onChange?.({
        ...defaultChangeProps,
        isLoading: false,
        stop: true,
        stopReason: "error",
      });
      onFinish?.();
      console.error(err);
    }
  };

  const generateTitleForSession = async (sessionId: string) => {
    const session = await getSessionById(sessionId);
    const assistant = getAssistantByKey(preferences.defaultAssistant);
    if (!assistant) {
      return;
    }

    const apiKey = apiKeys[assistant.model.baseModel];

    const selectedModel = await createInstance(assistant.model, apiKey);

    const firstMessage = session?.messages?.[0];

    if (
      !firstMessage ||
      !firstMessage.rawAI ||
      !firstMessage.rawHuman ||
      session?.messages?.length > 2
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

      const newTitle = generation?.content?.toString() || session.title;
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

  return { runModel, stopGeneration, generateTitleForSession };
};
