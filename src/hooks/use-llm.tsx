import { useToast } from "@/components/ui/use-toast";
import type { Serialized } from "@langchain/core/load/serializable";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { LLMResult } from "@langchain/core/outputs";
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableLike, RunnableSequence } from "@langchain/core/runnables";
import moment from "moment";
import { v4 } from "uuid";
import { PromptProps, TChatMessage, useChatSession } from "./use-chat-session";
import { TModelKey, useModelList } from "./use-model-list";
import { defaultPreferences, usePreferences } from "./use-preferences";

export type TRunModel = {
  props: PromptProps;
  sessionId: string;
  messageId?: string;
  model?: TModelKey;
};

export type TUseLLM = {
  onInit?: (props: TChatMessage) => Promise<void>;
  onStreamStart?: (props: TChatMessage) => Promise<void>;
  onStream?: (props: TChatMessage) => Promise<void>;
  onStreamEnd?: (props: TChatMessage) => Promise<void>;
  onError?: (props: TChatMessage) => Promise<void>;
};

export const useLLM = ({
  onInit,
  onStream,
  onStreamStart,
  onStreamEnd,
  onError,
}: TUseLLM) => {
  const { getSessionById, addMessageToSession, sortMessages, updateSession } =
    useChatSession();
  const { getApiKey, getPreferences } = usePreferences();
  const { createInstance, getModelByKey, getTestModelKey } = useModelList();
  const abortController = new AbortController();
  const { toast } = useToast();

  const stopGeneration = () => {
    abortController?.abort();
  };

  const preparePrompt = async (props: PromptProps, history: TChatMessage[]) => {
    const preferences = await getPreferences();
    const hasPreviousMessages = history?.length > 0;
    const systemPrompt =
      preferences.systemPrompt || defaultPreferences.systemPrompt;

    const system: BaseMessagePromptTemplateLike = [
      "system",
      `${systemPrompt}.${
        props.context
          ? `Answer user's question based on the following context: """{context}"""`
          : ``
      } ${
        hasPreviousMessages
          ? `You can also refer these previous conversations if needed:`
          : ``
      }`,
    ];

    const messageHolders = new MessagesPlaceholder("chat_history");

    const userContent = `{input}  `;

    const user: BaseMessagePromptTemplateLike = [
      "user",
      props?.image
        ? [
            {
              type: "text",
              content: userContent,
            },
            {
              type: "image_url",
              image_url: props.image,
            },
          ]
        : userContent,
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      system,
      messageHolders,
      user,
    ]);

    return prompt;
  };

  const runModel = async ({
    sessionId,
    messageId,
    props,
    model,
  }: TRunModel) => {
    const currentSession = await getSessionById(sessionId);

    if (!props?.query) {
      return;
    }

    const newMessageId = messageId || v4();
    const preferences = await getPreferences();
    const modelKey = model || preferences.defaultModel;

    const allPreviousMessages =
      currentSession?.messages?.filter((m) => m.id !== messageId) || [];
    const chatHistory = sortMessages(allPreviousMessages, "createdAt");
    const messageLimit =
      preferences.messageLimit || defaultPreferences.messageLimit;

    onInit?.({
      props,
      id: newMessageId,
      model: modelKey,
      sessionId,
      rawHuman: props.query,
      createdAt: moment().toISOString(),
      hasError: false,
      isLoading: true,
    });
    const selectedModelKey = getModelByKey(modelKey);
    if (!selectedModelKey) {
      throw new Error("Model not found");
    }

    const apiKey = await getApiKey(selectedModelKey?.baseModel);

    if (!apiKey) {
      onError?.({
        props,
        id: newMessageId,
        sessionId,
        model: modelKey,
        rawHuman: props.query,
        createdAt: moment().toISOString(),
        hasError: true,
        isLoading: false,
        errorMesssage: "API key not found",
      });
      return;
    }

    const prompt = await preparePrompt(
      props,
      currentSession?.messages?.filter((m) => m.id !== messageId) || []
    );

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

    const chain = RunnableSequence.from([
      prompt,
      selectedModel.bind({
        signal: abortController.signal,
      }) as RunnableLike,
    ]);

    const stream = await chain.stream(
      {
        chat_history: previousAllowedChatHistory || [],
        context: props.context,
        input: props.query,
      },
      {
        callbacks: [
          {
            handleLLMStart: async (llm: Serialized, prompts: string[]) => {
              console.log("LLM Start");
            },
            handleLLMEnd: async (output: LLMResult) => {
              console.log("LLM End", output);
            },

            handleText(text, runId, parentRunId, tags) {
              console.log("text", text);
            },
            handleLLMError: async (err: Error) => {
              console.error(err);
              toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
              });

              onError?.({
                props,
                id: newMessageId,
                sessionId,
                model: modelKey,
                rawHuman: props.query,
                createdAt: moment().toISOString(),
                hasError: true,
                isLoading: false,
                errorMesssage: "Something went wrong",
              });
            },
          },
        ],
      }
    );

    if (!stream) {
      return;
    }

    console.log("stream", stream);

    let streamedMessage = "";
    onStreamStart?.({
      id: newMessageId,
      props,
      sessionId,
      rawHuman: props.query,
      rawAI: streamedMessage,
      model: modelKey,
      isLoading: true,
      hasError: false,
      errorMesssage: undefined,
      createdAt: moment().toISOString(),
    });

    for await (const chunk of stream) {
      streamedMessage += chunk.content;
      onStream?.({
        id: newMessageId,
        props,
        sessionId,
        rawHuman: props.query,
        rawAI: streamedMessage,
        model: modelKey,
        isLoading: true,
        hasError: false,
        errorMesssage: undefined,
        createdAt: moment().toISOString(),
      });
    }

    const chatMessage: TChatMessage = {
      id: newMessageId,
      props,
      sessionId,
      rawHuman: props.query,
      rawAI: streamedMessage,
      model: modelKey,
      isLoading: false,
      hasError: false,
      createdAt: moment().toISOString(),
    };

    await addMessageToSession(sessionId, chatMessage);
    await generateTitleForSession(sessionId);
    await onStreamEnd?.(chatMessage);
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

    if (!firstMessage || !firstMessage.rawAI || !firstMessage.rawHuman) {
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
