import { useToast } from "@/components/ui/use-toast";
import { usePreferenceContext } from "@/context/preferences/provider";
import { useSessionsContext } from "@/context/sessions/provider";
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
import { TChatMessage, TChatSession } from "./use-chat-session";
import { TModelKey, useModelList } from "./use-model-list";
import { defaultPreferences } from "./use-preferences";
import { useTools } from "./use-tools";

export type TRunModel = {
  context?: string;
  input?: string;
  image?: string;
  sessionId: string;
  messageId?: string;
  model?: TModelKey;
};

export type TUseLLM = {
  onChange?: (props: TChatMessage) => void;
  onFinish?: () => void;
};

export const useLLM = ({ onChange, onFinish }: TUseLLM) => {
  const { addMessageToSession, getSessionById, updateSessionMutation } =
    useSessionsContext();
  const { apiKeys, preferences } = usePreferenceContext();
  const { createInstance, getModelByKey } = useModelList();
  const { toast } = useToast();
  const { getToolByKey } = useTools();
  const [abortController, setAbortController] = useState<AbortController>();

  const stopGeneration = () => {
    console.log("stop generation");
    abortController?.abort("cancel");
  };

  const preparePrompt = async ({
    context,
    image,
    history,
    bot,
  }: {
    context?: string;
    image?: string;
    history: TChatMessage[];
    bot?: TChatSession["bot"];
  }) => {
    const hasPreviousMessages = history?.length > 0;
    const systemPrompt =
      bot?.prompt ||
      preferences.systemPrompt ||
      defaultPreferences.systemPrompt;

    const system: BaseMessagePromptTemplateLike = [
      "system",
      `${systemPrompt} ${
        context
          ? `Answer user's question based on the following context: """{context}"""`
          : ``
      } ${
        hasPreviousMessages
          ? `You can also refer to these previous conversations`
          : ``
      }`,
    ];

    const messageHolders = new MessagesPlaceholder("chat_history");

    const userContent = `{input}  `;

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

  const runModel = async (props: TRunModel) => {
    const { sessionId, messageId, input, context, image, model } = props;
    const currentAbortController = new AbortController();
    setAbortController(currentAbortController);

    const selectedSession = await getSessionById(sessionId);
    console.log("run model", props);
    console.log("current session", selectedSession);

    if (!input) {
      return;
    }

    const newMessageId = messageId || v4();
    const modelKey = model || preferences.defaultModel;

    const allPreviousMessages =
      selectedSession?.messages?.filter((m) => m.id !== messageId) || [];
    const chatHistory = sortMessages(allPreviousMessages, "createdAt");
    const plugins = preferences.defaultPlugins || [];

    const messageLimit =
      preferences.messageLimit || defaultPreferences.messageLimit;

    const defaultChangeProps = {
      runModelProps: props,
      id: newMessageId,
      model: modelKey,
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
      bot: selectedSession?.bot,
    });

    const availableTools =
      selectedModelKey?.plugins
        ?.filter((p) => {
          return plugins.includes(p);
        })
        ?.map((p) => getToolByKey(p)?.tool())
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

    console.log("selectedModelFirst", selectedModel);
    console.log("selectedModelSecond", Object.create(selectedModel));

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

    console.log("available tools", availableTools);

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
                console.log("llm start");

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
                  "tool start",
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
                onChange?.({
                  ...defaultChangeProps,
                  isToolRunning: false,
                  toolName,
                  toolResult: output,
                });
              },
              handleAgentAction(action, runId, parentRunId, tags) {
                console.log("agent action", action);
              },

              handleLLMEnd: async (output: LLMResult) => {
                console.log("llm end", output);
              },
              handleLLMNewToken: async (token: string) => {
                console.log("token", token);

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
              handleChainEnd: async (output: LLMResult) => {
                console.log("chain end", output);
              },

              handleLLMError: async (err: Error) => {
                console.error(err);
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

      console.log("stream", stream);

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
      console.error(err);
    }
  };

  const generateTitleForSession = async (sessionId: string) => {
    const session = await getSessionById(sessionId);
    const modelKey = preferences.defaultModel;
    const selectedModelKey = getModelByKey(modelKey);

    console.log("generate title for session", session);

    if (!selectedModelKey) {
      throw new Error("Model not found");
    }

    const apiKey = apiKeys[selectedModelKey?.baseModel];

    const selectedModel = await createInstance(selectedModelKey, apiKey);

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

      console.log("title generation", generation);

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
