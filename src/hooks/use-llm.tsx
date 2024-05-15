import { getInstruction, getRole } from "@/lib/prompts";
import type { Serialized } from "@langchain/core/load/serializable";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { LLMResult } from "@langchain/core/outputs";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import moment from "moment";
import { v4 } from "uuid";
import { PromptProps, TChatMessage, useChatSession } from "./use-chat-session";
import { TModelKey, useModelList } from "./use-model-list";
import { usePreferences } from "./use-preferences";

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
  const { getSessionById, addMessageToSession } = useChatSession();
  const { getApiKey, getPreferences } = usePreferences();
  const { createInstance, getModelByKey } = useModelList();

  const preparePrompt = async (props: PromptProps, history: TChatMessage[]) => {
    const messageHistory = history;
    const prompt = ChatPromptTemplate.fromMessages(
      messageHistory?.length > 0
        ? [
            [
              "system",
              "You are {role} Answer user's question based on the following context:",
            ],
            new MessagesPlaceholder("chat_history"),
            ["user", "{input}"],
          ]
        : [
            props?.context
              ? [
                  "system",
                  "You are {role}.  Answer user's question based on the following context: {context}",
                ]
              : ["system", "You are {role}. {type}"],

            ["user", "{input}"],
          ]
    );

    const previousMessageHistory = messageHistory.reduce(
      (acc: (HumanMessage | AIMessage)[], { rawAI, rawHuman }) => [
        ...acc,
        new HumanMessage(rawHuman),
        new AIMessage(rawAI),
      ],
      []
    );

    return await prompt.formatMessages(
      messageHistory?.length > 0
        ? {
            role: getRole(props.role),
            chat_history: previousMessageHistory,
            input: props.query,
          }
        : {
            role: getRole(props.role),
            type: getInstruction(props.type),
            context: props.context,
            input: props.query,
          }
    );
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

    try {
      const newMessageId = v4();
      const formattedChatPrompt = await preparePrompt(
        props,
        currentSession?.messages || []
      );

      const abortController = new AbortController();
      abortController.abort();

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
        human: new HumanMessage(props.query),
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
    } catch (e: any) {
      console.log(typeof e, e?.error?.error?.message);
      console.log(typeof e, e?.error);

      onError({
        props,
        sessionId,
        model: modelKey,
        error: e?.error?.error?.message || e?.error,
        loading: false,
      });
    }
  };

  return {
    runModel,
  };
};
