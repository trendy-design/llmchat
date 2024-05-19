"use client";
import { PromptProps, TChatSession } from "@/hooks/use-chat-session";
import { createContext, useContext } from "react";

export type TChatContext = {
  sessions: TChatSession[];
  refetchSessions: () => void;
  isAllSessionLoading: boolean;
  isCurrentSessionLoading: boolean;
  currentSession: TChatSession | undefined;
  createSession: () => Promise<TChatSession>;
  streaming: boolean;
  removeSession: (sessionId: string) => Promise<void>;
  clearChatSessions: () => Promise<void>;
  stopGeneration: () => void;
  runModel: (props: PromptProps, sessionId: string) => Promise<void>;
  removeMessage: (messageId: string) => void;
};

export const ChatContext = createContext<TChatContext | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
