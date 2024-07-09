"use client";
import { useToast } from "@/components/ui/use-toast";
import { TToolResponse, defaultPreferences, useTools } from "@/hooks";
import {
  TAssistant,
  TChatMessage,
  TLLMInputProps,
} from "@/hooks/use-chat-session";
import { useModelList } from "@/hooks/use-model-list";
import { removeExtraSpaces, sortMessages } from "@/lib/helper";
import { DisableEnter, ShiftEnterToLineBreak } from "@/lib/tiptap-extensions";
import type { Serialized } from "@langchain/core/load/serializable";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { LLMResult } from "@langchain/core/outputs";
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Highlight } from "@tiptap/extension-highlight";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Text } from "@tiptap/extension-text";
import { useEditor } from "@tiptap/react";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";

import { XMLOutputParser } from "@langchain/core/output_parsers";
import moment from "moment";
import { createContext, useContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { usePreferenceContext } from "./preferences";
import { useSessionsContext } from "./sessions";
import { useSettingsContext } from "./settings";

export type TChatContext = {
  editor: ReturnType<typeof useEditor>;
  sendMessage: (image?: string) => void;
  handleRunModel: (props: TLLMInputProps, clear?: () => void) => void;
  openPromptsBotCombo: boolean;
  setOpenPromptsBotCombo: (value: boolean) => void;
  contextValue: string;
  isGenerating: boolean;
  setContextValue: (value: string) => void;
  stopGeneration: () => void;
};

export const ChatContext = createContext<undefined | TChatContext>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export type TChatProvider = {
  children: React.ReactNode;
};

export const ChatProvider = ({ children }: TChatProvider) => {
  const {
    setCurrentSession,
    refetchSessions,
    currentSession,
    addMessageToSession,
  } = useSessionsContext();
  const { getAssistantByKey } = useModelList();
  const [openPromptsBotCombo, setOpenPromptsBotCombo] = useState(false);
  const [contextValue, setContextValue] = useState("");
  const { open: openSettings } = useSettingsContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<TChatMessage>();
  const [currentTools, setCurrentTools] = useState<TToolResponse[]>([]);
  const { getSessionById, updateSessionMutation } = useSessionsContext();
  const { apiKeys, preferences, updatePreferences } = usePreferenceContext();
  const { createInstance, getModelByKey } = useModelList();
  const { toast } = useToast();
  const { getToolByKey } = useTools();

  const [abortController, setAbortController] = useState<AbortController>();

  const updateCurrentMessage = (update: Partial<TChatMessage>) => {
    setCurrentMessage((prev) => {
      if (!!prev) {
        return {
          ...prev,
          ...update,
        };
      }
      return prev;
    });
  };

  useEffect(() => {
    const props = currentMessage;

    props &&
      setCurrentSession?.((session) => {
        if (!session) return undefined;
        const exisingMessage = session.messages.find(
          (message) => message.id === props.id
        );
        if (exisingMessage) {
          return {
            ...session,
            messages: session.messages.map((message) => {
              if (message.id === props.id) {
                return { message, ...{ ...props, tools: currentTools } };
              }
              return message;
            }),
          };
        }

        return {
          ...session,
          messages: [...session.messages, { ...props, tools: currentTools }],
        };
      });

    if (currentMessage?.stop) {
      currentMessage?.sessionId &&
        addMessageToSession(currentMessage?.sessionId, {
          ...currentMessage,
          isLoading: false,
          tools: currentTools?.map((t) => ({ ...t, toolLoading: false })),
        });
      setIsGenerating(false);
    }
  }, [currentMessage, currentTools]);

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
      `${systemPrompt}\n Things to remember: \n ${preferences.memories.join(
        "\n"
      )}\n ${
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

    const assiatntProps = getAssistantByKey(assistant.key);

    const base64ImageMessage = new HumanMessage({
      content: [
        {
          type: "text",
          text: `${userContent}`,
        },
        {
          type: "image_url",
          image_url: image,
        },
      ],
    });

    const user: BaseMessagePromptTemplateLike = [
      "user",
      image ? base64ImageMessage.content : userContent,
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
    setIsGenerating(true);
    setCurrentMessage(undefined);
    setCurrentTools([]);

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

    setCurrentMessage({
      inputProps: props,
      id: newMessageId,
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
            updatePreferences,
            preferences,
            apiKeys,
            sendToolResponse: (arg: TToolResponse) => {
              setCurrentTools((tools) =>
                tools.map((t) => {
                  if (t.toolName === arg.toolName) {
                    return {
                      ...arg,
                      toolLoading: false,
                    };
                  }
                  return t;
                })
              );
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

    const parser = new XMLOutputParser();

    // Creating a copy of the model
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
              handleLLMStart: async (llm: Serialized, prompts: string[]) => {},
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

                name &&
                  setCurrentTools((tools) => [
                    ...tools,
                    { toolName: name, toolLoading: true },
                  ]);
              },
              handleToolError(err, runId, parentRunId, tags) {},
              handleToolEnd(output, runId, parentRunId, tags) {},

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
        stopReason: "error",
      });
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

  const handleRunModel = async (props: TLLMInputProps, clear?: () => void) => {
    if (!props?.input) {
      return;
    }

    const assitantprops = getAssistantByKey(props?.assistant.key);

    if (!assitantprops) {
      return;
    }

    const apiKey = apiKeys[assitantprops.model.baseModel];

    if (!apiKey && assitantprops.model.baseModel !== "ollama") {
      toast({
        title: "Ahh!",
        description: "API key is missing. Please check your settings.",
        variant: "destructive",
      });
      openSettings(`models/${assitantprops.model.baseModel}`);
      return;
    }

    setContextValue("");
    clear?.();
    await runModel({
      sessionId: props?.sessionId?.toString(),
      input: removeExtraSpaces(props?.input),
      context: removeExtraSpaces(props?.context),
      image: props?.image,
      assistant: assitantprops.assistant,
      messageId: props?.messageId,
    });
    refetchSessions?.();
  };

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: "Type / or Ask anything...",
      }),
      ShiftEnterToLineBreak,
      Highlight.configure({
        HTMLAttributes: {
          class: "prompt-highlight",
        },
      }),
      HardBreak,
      DisableEnter,
    ],
    content: ``,
    autofocus: true,
    onTransaction(props) {
      const { editor } = props;
      const text = editor.getText();
      const html = editor.getHTML();
      if (text === "/") {
        setOpenPromptsBotCombo(true);
      } else {
        const newHTML = html.replace(
          /{{{{(.*?)}}}}/g,
          ` <mark class="prompt-highlight">$1</mark> `
        );

        if (newHTML !== html) {
          editor.commands.setContent(newHTML, true, {
            preserveWhitespace: true,
          });
        }
        setOpenPromptsBotCombo(false);
      }
    },

    parseOptions: {
      preserveWhitespace: "full",
    },
  });

  const sendMessage = async (image?: string) => {
    if (!editor || !currentSession?.id) {
      return;
    }
    const props = getAssistantByKey(preferences.defaultAssistant);
    if (!props) {
      return;
    }
    handleRunModel(
      {
        input: editor.getText(),
        image,
        context: contextValue,
        sessionId: currentSession?.id?.toString(),
        assistant: props.assistant,
      },
      () => {
        editor.commands.clearContent();
        editor.commands.insertContent("");
        editor.commands.focus("end");
      }
    );
  };
  return (
    <ChatContext.Provider
      value={{
        editor,
        sendMessage,
        handleRunModel,
        openPromptsBotCombo,
        setOpenPromptsBotCombo,
        contextValue,
        isGenerating,
        setContextValue,
        stopGeneration,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
