import { useChatContext } from "@/context";
import { useScrollToBottom } from "@/hooks";
import { TChatMessage } from "@/types";
import { useEffect, useMemo } from "react";
import { AIMessage } from "./ai/ai-message";
import { HumanMessage } from "./human-message";

export const PreviousMessages = () => {
  const { store } = useChatContext();
  const messages = store((state) => state.messages) || [];
  const currentMessage = store((state) => state.currentMessage);
  const { scrollToBottom } = useScrollToBottom();

  const renderMessage = (message: TChatMessage, index: number) => {
    const isLast = !currentMessage && messages.length - 1 === index;
    return (
      <div className="flex w-full flex-col items-end gap-1" key={message.id}>
        <HumanMessage chatMessage={message} isLast={isLast} />

        <AIMessage message={message} isLast={isLast} />
      </div>
    );
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const previousMessages = useMemo(() => {
    return messages.map(renderMessage);
  }, [messages, currentMessage]);

  return previousMessages;
};
