import type { Serialized } from "@langchain/core/load/serializable";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { LLMResult } from "@langchain/core/outputs";
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import moment from "moment";
import { v4 } from "uuid";
import { PromptProps, TChatMessage, useChatSession } from "./use-chat-session";
import { TModelKey, useModelList } from "./use-model-list";
import { defaultPreferences, usePreferences } from "./use-preferences";

export type TStreamProps = {
  props: PromptProps;
  model: TModelKey;
  sessionId: string;
  message?: string;
  loading?: boolean;
  error?: string;
};

export type TUseLLM = {
  onInit: (props: TStreamProps) => Promise<void>;
  onStreamStart: (props: TStreamProps) => Promise<void>;
  onStream: (props: TStreamProps) => Promise<void>;
  onStreamEnd: (props: TStreamProps) => Promise<void>;
  onError: (props: TStreamProps) => Promise<void>;
};

export const useLLM = ({
  onInit,
  onStream,
  onStreamStart,
  onStreamEnd,
  onError,
}: TUseLLM) => {
  const { getSessionById, addMessageToSession, sortMessages } =
    useChatSession();
  const { getApiKey, getPreferences } = usePreferences();
  const { createInstance, getModelByKey } = useModelList();
  const abortController = new AbortController();

  const stopGeneration = () => {
    abortController?.abort();
  };

  const preparePrompt = async (props: PromptProps, history: TChatMessage[]) => {
    const preferences = await getPreferences();
    const messageLimit =
      preferences.messageLimit || defaultPreferences.messageLimit;
    const hasPreviousMessages = history?.length > 0;
    const systemPrompt =
      preferences.systemPrompt || defaultPreferences.systemPrompt;

    const system: BaseMessagePromptTemplateLike = [
      "system",
      `${systemPrompt}. `,
    ];

    const messageHolders = new MessagesPlaceholder("chat_history");

    const userContent = `{input} ${
      props.context
        ? `Answer user's question based on the following context: """{context}"""`
        : ``
    } ${
      hasPreviousMessages
        ? `You can also refer these previous conversations if needed:`
        : ``
    } `;

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

    const previousMessageHistory = sortMessages(history, "createdAt")
      .slice(0, messageLimit === "all" ? history.length : messageLimit)
      .reduce(
        (acc: (HumanMessage | AIMessage)[], { rawAI, rawHuman, image }) => [
          ...acc,
          new HumanMessage(rawHuman),
          new AIMessage(rawAI),
        ],
        []
      );

    console.log(messageLimit, previousMessageHistory);

    return await prompt.formatMessages({
      chat_history: previousMessageHistory || [],
      context: props.context,
      input: props.query,
    });
  };

  const runModel = async (props: PromptProps, sessionId: string) => {
    const currentSession = await getSessionById(sessionId);

    if (!props?.query) {
      return;
    }

    const preferences = await getPreferences();
    const modelKey = preferences.defaultModel;
    onInit({ props, model: modelKey, sessionId, loading: true });
    const selectedModel = getModelByKey(modelKey);
    if (!selectedModel) {
      throw new Error("Model not found");
    }

    const apiKey = await getApiKey(selectedModel?.baseModel);

    if (!apiKey) {
      onError({
        props,
        model: modelKey,
        sessionId,
        error: "No API key found",
        loading: false,
      });
      return;
    }

    const newMessageId = v4();
    const formattedChatPrompt = await preparePrompt(
      props,
      currentSession?.messages || []
    );

    const model = await createInstance(selectedModel, apiKey);
    const stream = await model.stream(formattedChatPrompt, {
      options: {
        stream: true,
        signal: abortController.signal,
      },

      callbacks: [
        {
          handleLLMStart: async (llm: Serialized, prompts: string[]) => {
            console.log(JSON.stringify(llm, null, 2));
            console.log(JSON.stringify(prompts, null, 2));
          },
          handleLLMEnd: async (output: LLMResult) => {
            console.log(JSON.stringify(output, null, 2));
          },
          handleLLMError: async (err: Error) => {
            console.error(err);
          },
        },
      ],
    });
    if (!stream) {
      return;
    }
    let streamedMessage = "";
    onStreamStart({
      props,
      sessionId,
      message: streamedMessage,
      model: modelKey,
      loading: true,
    });
    for await (const chunk of stream) {
      streamedMessage += chunk.content;

      console.log(streamedMessage);
      onStream({
        props,
        sessionId,
        message: streamedMessage,
        model: modelKey,
        loading: true,
      });
    }

    const chatMessage: TChatMessage = {
      id: newMessageId,
      model: selectedModel.key,
      human: props?.image
        ? new HumanMessage({
            content: [
              {
                type: "text",
                content: streamedMessage,
              },
              {
                type: "image_url",
                image_url: props.image,
              },
            ],
          })
        : new HumanMessage(props.query),
      ai: new AIMessage(streamedMessage),
      rawHuman: props.query,
      rawAI: streamedMessage,
      props,
      createdAt: moment().toISOString(),
    };

    addMessageToSession(sessionId, chatMessage).then(() => {
      onStreamEnd({
        props,
        sessionId,
        message: streamedMessage,
        model: modelKey,
        loading: false,
      });
    });
  };

  return {
    runModel,
    stopGeneration,
  };
};
