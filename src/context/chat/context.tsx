import { TChatSession } from "@/hooks/use-chat-session";
import { createContext, useContext } from "react";

export type TChatContext = {
  chatSession: TChatSession[];
};

export const ChatContext = createContext<TChatContext | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
