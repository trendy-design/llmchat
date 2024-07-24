"use client";
import { useTitleGenerator } from "@/hooks/use-title-generator";
import { createChatStore } from "@/store/chat/store";
import { TChatContext, TChatProvider } from "@/types/chat";
import { useParams } from "next/navigation";
import { FC, createContext, useContext, useEffect, useMemo } from "react";
import { useSessions } from "./sessions";

export const ChatContext = createContext<undefined | TChatContext>(undefined);

export const ChatProvider: FC<TChatProvider> = ({ children }) => {
  const { sessionId } = useParams();
  const store = useMemo(() => createChatStore(), []); // Create a unique store for each provider
  const setSession = store((state) => state.setSession);
  const setMessages = store((state) => state.setMessages);
  const currentMessage = store((state) => state.currentMessage);
  const addMessage = store((state) => state.addMessage);
  const setIsGenerating = store((state) => state.setIsGenerating);

  const { generateTitleForSession } = useTitleGenerator();
  const {
    useGetSessionByIdQuery,
    addMessageMutation,
    useMessagesQuery,
    createSession,
  } = useSessions();

  const currentSession = useGetSessionByIdQuery(sessionId as string);
  const messages = useMessagesQuery(sessionId as string);

  useEffect(() => {
    if (!currentMessage) return;

    addMessage(currentMessage);

    if (currentMessage.stop && currentMessage.sessionId) {
      addMessageMutation.mutate(
        {
          parentId: currentMessage.sessionId,
          message: currentMessage,
        },
        {
          onSuccess: async (messages) => {
            setIsGenerating(false);
            if (messages?.[0].sessionId && messages?.length < 2) {
              await generateTitleForSession(messages?.[0].sessionId as string);
            }
          },
        }
      );
    }
  }, [currentMessage]);

  useEffect(() => {
    currentSession?.data && setSession(currentSession?.data || []);
  }, [currentSession?.data]);

  useEffect(() => {
    if (currentSession?.error) {
      createSession({ redirect: true });
    }
  }, [currentSession?.error]);

  useEffect(() => {
    if (messages?.data) {
      console.log("messages", messages);
      setMessages(messages.data);
    }
  }, [messages?.data]);

  return (
    <ChatContext.Provider
      value={{
        store,
        refetch: () => {
          currentSession?.refetch();
          messages?.refetch();
        },
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
