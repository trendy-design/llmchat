"use client";
import { PromptProps, TChatSession } from "@/hooks/use-chat-session";
import { TStreamProps } from "@/hooks/use-llm";
import { createContext, useContext } from "react";

export type TChatContext = {
  sessions: TChatSession[];
  refetchSessions: () => void;
  isSessionLoading: boolean;
  currentSession: TChatSession | undefined;
  createSession: () => Promise<TChatSession>;
  lastStream?: TStreamProps;
  error?: string;
  runModel: (props: PromptProps, sessionId: string) => Promise<void>;
};

export const ChatContext = createContext<TChatContext | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
