"use client";
import { TBot } from "@/hooks/use-bots";
import {
  TChatMessage,
  TChatSession,
  useChatSession,
} from "@/hooks/use-chat-session";
import { TRunModel, useLLM } from "@/hooks/use-llm";
import Document from "@tiptap/extension-document";
import Highlight from "@tiptap/extension-highlight";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatContext } from "./context";

import { useToast } from "@/components/ui/use-toast";
import { useModelList } from "@/hooks/use-model-list";
import { usePreferences } from "@/hooks/use-preferences";
import { removeExtraSpaces } from "@/lib/helper";
import { ShiftEnterToLineBreak } from "@/lib/tiptap-extensions";
import HardBreak from "@tiptap/extension-hard-break";
import Text from "@tiptap/extension-text";
import { useSettings } from "../settings/context";

export type TChatProvider = {
  children: React.ReactNode;
};

export const ChatProvider = ({ children }: TChatProvider) => {
  const { sessionId } = useParams();
  const {
    getSessions,
    createNewSession,
    getSessionById,
    clearSessions,
    removeSessionById,
    removeMessageById,
  } = useChatSession();
  const [sessions, setSessions] = useState<TChatSession[]>([]);
  const [isAllSessionLoading, setAllSessionLoading] = useState<boolean>(true);
  const [isCurrentSessionLoading, setCurrentSessionLoading] =
    useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<
    TChatSession | undefined
  >();
  const { push, refresh } = useRouter();
  const { getPreferences, getApiKey } = usePreferences();
  const { getModelByKey } = useModelList();
  const { toast } = useToast();
  const { open: openSettings } = useSettings();
  const [contextValue, setContextValue] = useState<string>("");
  const [openPromptsBotCombo, setOpenPromptsBotCombo] = useState(false);

  const appendToCurrentSession = (props: TChatMessage) => {
    setCurrentSession((session) => {
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
    fetchAllSessions();
  };

  const { runModel, stopGeneration } = useLLM({
    onChange: appendToCurrentSession,
  });

  const fetchCurrentSession = async () => {
    if (!sessionId) {
      return;
    }
    getSessionById(sessionId?.toString()).then((session) => {
      if (session) {
        setCurrentSession(session);
        setCurrentSessionLoading(false);
      } else {
        createNewSession().then((session) => {
          push(`/chat/${session.id}`);
          refresh();
        });
      }
    });
  };

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    setCurrentSessionLoading(true);
    fetchCurrentSession();
  }, [sessionId]);

  const fetchAllSessions = async () => {
    const sessions = await getSessions();
    setSessions(sessions);
    setAllSessionLoading(false);
  };

  const createSession = async (props: { bot?: TBot; redirect?: boolean }) => {
    const { bot, redirect } = props;
    const newSession = await createNewSession(bot);
    if (redirect) {
      push(`/chat/${newSession.id}`);
      refresh();
    }
  };

  useEffect(() => {
    setAllSessionLoading(true);
    fetchAllSessions();
  }, []);

  const clearChatSessions = async () => {
    clearSessions().then(() => {
      setSessions([]);
    });
  };

  const removeSession = async (sessionId: string) => {
    setCurrentSessionLoading(true);
    await removeSessionById(sessionId);
    setCurrentSessionLoading(false);
    setAllSessionLoading(true);
    await fetchAllSessions();
    setAllSessionLoading(false);
  };

  const removeMessage = (messageId: string) => {
    if (!currentSession?.id) {
      return;
    }
    setCurrentSessionLoading(true);
    removeMessageById(currentSession?.id, messageId).then(async (sessions) => {
      fetchCurrentSession().then(() => {
        setCurrentSessionLoading(false);
      });
    });
  };

  const handleRunModel = (props: TRunModel, clear?: () => void) => {
    console.log("sessionId", sessionId);
    console.log("currentSession", currentSession);
    console.log("handleRun", props);
    if (!props?.input) {
      return;
    }

    getPreferences().then(async (preference) => {
      const selectedModel = getModelByKey(
        props?.model || preference.defaultModel
      );
      // if (
      //   selectedModel?.key &&
      //   !["gpt-4-turbo", "gpt-4o"].includes(selectedModel?.key) &&
      //   attachment?.base64
      // ) {
      //   toast({
      //     title: "Ahh!",
      //     description: "This model does not support image input.",
      //     variant: "destructive",
      //   });
      //   return;
      // }

      if (!selectedModel?.baseModel) {
        throw new Error("Model not found");
      }

      const apiKey = await getApiKey(selectedModel?.baseModel);

      if (!apiKey) {
        toast({
          title: "Ahh!",
          description: "API key is missing. Please check your settings.",
          variant: "destructive",
        });
        openSettings(selectedModel?.baseModel);
        return;
      }

      // setAttachment(undefined);
      setContextValue("");
      clear?.();
      console.log(props);
      await runModel({
        sessionId: props?.sessionId?.toString(),
        input: removeExtraSpaces(props?.input),
        context: removeExtraSpaces(props?.context),
        image: props?.image,
        model: selectedModel?.key,
        messageId: props?.messageId,
      });
      await fetchAllSessions();
    });
  };

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: "Type / or Enter prompt here...",
      }),
      ShiftEnterToLineBreak,
      Highlight.configure({
        HTMLAttributes: {
          class: "prompt-highlight",
        },
      }),
      HardBreak,
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
      preserveWhitespace: true,
    },
  });

  const sendMessage = async () => {
    if (!editor) {
      return;
    }
    console.log("send button click", sessionId);
    handleRunModel(
      {
        input: editor.getText(),
        sessionId: sessionId?.toString(),
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
        sessions,
        refetchSessions: fetchAllSessions,
        refetchCurrentSession: fetchCurrentSession,
        isAllSessionLoading,
        isCurrentSessionLoading,
        createSession,
        handleRunModel,
        editor,
        clearChatSessions,
        removeSession,
        currentSession,
        sendMessage,
        stopGeneration,
        removeMessage,
        openPromptsBotCombo,
        setOpenPromptsBotCombo,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
