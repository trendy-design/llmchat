"use client";
import { TChatContext, TChatProvider } from "@/lib/types";
import { FC, createContext, useContext, useEffect, useMemo } from "react";
import { createChatStore } from "../store/chat/store";
import { useSessions } from "./sessions";

export const ChatContext = createContext<undefined | TChatContext>(undefined);

export const ChatProvider: FC<TChatProvider> = ({ children, sessionId }) => {
  const store = useMemo(() => createChatStore(), []);
  const setSession = store((state) => state.setSession);
  const setCurrentMessage = store((state) => state.setCurrentMessage);
  const setMessages = store((state) => state.setMessages);

  const { useGetSessionByIdQuery, useMessagesQuery, createSession } =
    useSessions();

  const currentSession = useGetSessionByIdQuery(sessionId as string);
  const messages = useMessagesQuery(sessionId as string);

  useEffect(() => {
    if (currentSession?.data) {
      setSession(currentSession?.data || []);
      setCurrentMessage(undefined);
    } else if (currentSession?.isFetched && !currentSession?.data) {
      createSession();
    }
  }, [currentSession?.data]);

  useEffect(() => {
    if (sessionId && currentSession?.error) {
      setCurrentMessage(undefined);
      createSession();
    }
  }, [currentSession?.error, sessionId]);

  useEffect(() => {
    if (messages?.data) {
      setMessages(messages.data);
    }
  }, [messages?.data]);

  return (
    <ChatContext.Provider
      value={{
        store,
        isReady: !!currentSession?.data?.id,
        refetch: () => {
          currentSession?.refetch();
          messages?.refetch();
          setCurrentMessage(undefined);
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
