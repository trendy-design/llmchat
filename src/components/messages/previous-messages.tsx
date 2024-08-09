import { useChatContext } from "@/context";
import { useScrollToBottom } from "@/hooks";
import { TChatMessage } from "@/types";
import { useEffect, useMemo } from "react";
import { Message } from "./message";

export const PreviousMessages = () => {
  const { store } = useChatContext();
  const messages = store((state) => state.messages) || [];
  const currentMessage = store((state) => state.currentMessage);
  const { scrollToBottom } = useScrollToBottom();

  const renderMessage = (message: TChatMessage, index: number) => {
    const isLast = !currentMessage && messages.length - 1 === index;
    return <Message message={message} isLast={isLast} />;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const previousMessages = useMemo(() => {
    return messages.map(renderMessage);
  }, [messages, currentMessage?.stop]);

  return previousMessages;
};
