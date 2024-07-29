"use client";
import { useRelatedQuestions } from "@/hooks/use-related-questions";
import { useTitleGenerator } from "@/hooks/use-title-generator";
import { createChatStore } from "@/store/chat/store";
import { TChatContext, TChatProvider } from "@/types/chat";
import { FC, createContext, useContext, useEffect, useMemo } from "react";
import { useSessions } from "./sessions";

export const ChatContext = createContext<undefined | TChatContext>(undefined);

export const ChatProvider: FC<TChatProvider> = ({ children, sessionId }) => {
  const store = useMemo(() => createChatStore(), []);
  const setSession = store((state) => state.setSession);
  const setMessages = store((state) => state.setMessages);

  const currentMessage = store((state) => state.currentMessage);
  const addMessage = store((state) => state.addMessage);
  const setIsGenerating = store((state) => state.setIsGenerating);

  const { generateTitleForSession } = useTitleGenerator();
  const { generateRelatedQuestion } = useRelatedQuestions();
  const {
    useGetSessionByIdQuery,
    addMessageMutation,
    updateSessionMutation,
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
            console.log("start generating questions");
            const questions = await generateRelatedQuestion(
              currentMessage.sessionId,
              currentMessage.id,
            );
            console.log("questions", questions);

            const message = {
              ...currentMessage,
              relatedQuestions: questions,
            };
            console.log("messageee", message);
            addMessage(message);
            addMessageMutation.mutate({
              parentId: currentMessage.sessionId,
              message: message,
            });
          },
        },
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
