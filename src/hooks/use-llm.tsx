import { useToast } from "@/components/ui/use-toast";
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
import { v4 } from "uuid";
import { TChatMessage, TChatSession, useChatSession } from "./use-chat-session";
import { TModelKey, useModelList } from "./use-model-list";
import { defaultPreferences, usePreferences } from "./use-preferences";
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
};

export const useLLM = ({ onChange }: TUseLLM) => {
  const { getSessionById, addMessageToSession, sortMessages, updateSession } =
    useChatSession();
  const { getApiKey, getPreferences } = usePreferences();
  const { createInstance, getModelByKey } = useModelList();
  const abortController = new AbortController();
  const { toast } = useToast();
  const { getToolByKey } = useTools();

  const stopGeneration = () => {
    abortController?.abort();
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
    const preferences = await getPreferences();
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
    const currentSession = await getSessionById(sessionId);

    console.log("run model", props);
    console.log("current session", currentSession);

    if (!input) {
      return;
    }

    const newMessageId = messageId || v4();
    const preferences = await getPreferences();
    const modelKey = model || preferences.defaultModel;

    const allPreviousMessages =
      currentSession?.messages?.filter((m) => m.id !== messageId) || [];
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

    const apiKey = await getApiKey(selectedModelKey?.baseModel);

    if (!apiKey) {
      onChange?.({
        ...defaultChangeProps,
        isLoading: false,
        hasError: true,
        errorMesssage: "API key not found",
      });
      return;
    }

    const prompt = await preparePrompt({
      context: context,
      image,
      history:
        currentSession?.messages?.filter((m) => m.id !== messageId) || [],
      bot: currentSession?.bot,
    });

    const selectedModel = await createInstance(selectedModelKey, apiKey);

    const previousAllowedChatHistory = chatHistory
      .slice(0, messageLimit === "all" ? history.length : messageLimit)
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

    const availableTools =
      selectedModelKey?.plugins
        ?.filter((p) => {
          return plugins.includes(p);
        })
        ?.map((p) => getToolByKey(p)?.(preferences))
        ?.filter((t): t is any => !!t) || [];

    let agentExecutor: AgentExecutor | undefined;

    if (availableTools?.length) {
      const agentWithTool = await createToolCallingAgent({
        llm: selectedModel as any,
        tools: availableTools,
        prompt: prompt as any,
        streamRunnable: true,
      });

      agentExecutor = new AgentExecutor({
        agent: agentWithTool,
        tools: availableTools,
      });
    }
    const chainWithoutTools = prompt.pipe(selectedModel as any);

    let streamedMessage = "";
    let toolName: string | undefined;

    const stream: any = await (!!availableTools?.length && agentExecutor
      ? agentExecutor
      : chainWithoutTools
    ).invoke(
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
                hasError: false,
                toolName,
                errorMesssage: undefined,
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
                hasError: false,
                errorMesssage: undefined,
              });
            },
            handleChainEnd: async (output: LLMResult) => {
              console.log("chain end", output);
            },

            handleLLMError: async (err: Error) => {
              console.error(err);
              toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
              });
              onChange?.({
                ...defaultChangeProps,
                isLoading: false,
                hasError: true,
                errorMesssage: "Something went wrong",
              });
            },
          },
        ],
      }
    );

    console.log("stream", stream);

    const chatMessage: TChatMessage = {
      ...defaultChangeProps,
      rawHuman: input,
      rawAI: stream?.content || stream?.output,
      isToolRunning: false,
      toolName,
      isLoading: false,
      hasError: false,
      createdAt: moment().toISOString(),
    };

    console.log("saving", chatMessage);
    await addMessageToSession(sessionId, chatMessage);
    await generateTitleForSession(sessionId);
    await onChange?.(chatMessage);
  };

  const generateTitleForSession = async (sessionId: string) => {
    const session = await getSessionById(sessionId);
    const preferences = await getPreferences();
    const modelKey = preferences.defaultModel;
    const selectedModelKey = getModelByKey(modelKey);

    if (!selectedModelKey) {
      throw new Error("Model not found");
    }

    const apiKey = await getApiKey(selectedModelKey?.baseModel);

    if (!apiKey) {
      throw new Error("API key not found");
    }

    const selectedModel = await createInstance(selectedModelKey, apiKey);

    console.log("title session", session);

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
      await updateSession(
        sessionId,
        newTitle ? { title: newTitle, updatedAt: moment().toISOString() } : {}
      );
    } catch (e) {
      console.error(e);
      return firstMessage.rawHuman;
    }
  };

  return { runModel, stopGeneration, generateTitleForSession };
};
