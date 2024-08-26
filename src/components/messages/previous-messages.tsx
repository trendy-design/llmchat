import { useChatContext } from "@/context";
import { useScrollToBottom } from "@/hooks";
import { TChatMessage } from "@/types";
import { useEffect, useMemo } from "react";
import { Message } from "./message";

export const PreviousMessages = () => {
  const { store } = useChatContext();
  const messages = store((state) => state.messages) || [];
  const isStopped = store((state) => state.currentMessage?.stop);
  const hasCurrentMessage = store((state) => !!state.currentMessage);
  const { scrollToBottom } = useScrollToBottom();

  const renderMessage = (message: TChatMessage, index: number) => {
    const isLast = !hasCurrentMessage && messages.length - 1 === index;
    return <Message message={message} isLast={isLast} />;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const previousMessages = useMemo(() => {
    return messages.map(renderMessage);
  }, [messages, isStopped]);

  return previousMessages;
};