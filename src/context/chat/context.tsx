"use client";
import { TBot } from "@/hooks/use-bots";
import { TChatSession } from "@/hooks/use-chat-session";
import { TRunModel } from "@/hooks/use-llm";
import { createContext, useContext } from "react";

export type TChatContext = {
  sessions: TChatSession[];
  refetchSessions: () => void;
  isAllSessionLoading: boolean;
  isCurrentSessionLoading: boolean;
  currentSession: TChatSession | undefined;
  createSession: (bot?: TBot, redirect?: boolean) => Promise<TChatSession>;
  removeSession: (sessionId: string) => Promise<void>;
  clearChatSessions: () => Promise<void>;
  stopGeneration: () => void;
  refetchCurrentSession: () => Promise<void>;
  runModel: (props: TRunModel) => Promise<void>;
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
