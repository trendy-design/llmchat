"use client";
import { createChatStore } from "@/store/chat/store";
import { TChatContext, TChatProvider } from "@/types/chat";
import { FC, createContext, useContext, useEffect, useMemo } from "react";
import { useSessions } from "./sessions";

export const ChatContext = createContext<undefined | TChatContext>(undefined);

export const ChatProvider: FC<TChatProvider> = ({ children, sessionId }) => {
  const store = useMemo(() => createChatStore(), []);
  const setSession = store((state) => state.setSession);
  const setMessages = store((state) => state.setMessages);

  const { useGetSessionByIdQuery, useMessagesQuery, createSession } =
    useSessions();

  const currentSession = useGetSessionByIdQuery(sessionId as string);
  const messages = useMessagesQuery(sessionId as string);

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
