"use client";
import { useToast } from "@/components/ui/use-toast";
import { TChatMessage, TLLMInputProps } from "@/hooks/use-chat-session";
import { useLLM } from "@/hooks/use-llm";
import { useModelList } from "@/hooks/use-model-list";
import { removeExtraSpaces } from "@/lib/helper";
import { DisableEnter, ShiftEnterToLineBreak } from "@/lib/tiptap-extensions";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Highlight } from "@tiptap/extension-highlight";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Text } from "@tiptap/extension-text";
import { useEditor } from "@tiptap/react";
import { createContext, useContext, useState } from "react";
import { usePreferenceContext } from "./preferences";
import { useSessionsContext } from "./sessions";
import { useSettingsContext } from "./settings";

export type TChatContext = {
  editor: ReturnType<typeof useEditor>;
  sendMessage: () => void;
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
  const { setCurrentSession, refetchSessions, currentSession } =
    useSessionsContext();
  const { getAssistantByKey } = useModelList();
  const { toast } = useToast();
  const [openPromptsBotCombo, setOpenPromptsBotCombo] = useState(false);
  const [contextValue, setContextValue] = useState("");
  const { open: openSettings } = useSettingsContext();
  const { preferences, apiKeys } = usePreferenceContext();
  const [isGenerating, setIsGenerating] = useState(false);

  const appendToCurrentSession = (props: TChatMessage) => {
    setIsGenerating(true);
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
              return { message, ...props };
            }
            return message;
          }),
        };
      }

      return {
        ...session,
        messages: [...session.messages, props],
      };
    });
    refetchSessions?.();
  };
  const { runModel, stopGeneration } = useLLM({
    onChange: appendToCurrentSession,
    onFinish: () => {
      setIsGenerating(false);
    },
  });

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
      openSettings(assitantprops.model.baseModel);
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

  const sendMessage = async () => {
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
