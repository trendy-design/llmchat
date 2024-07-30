import { useChatContext } from "@/context";
import { TChatMessage } from "@/types";
import { useMemo } from "react";
import { AIMessage } from "./ai/ai-message";
import { HumanMessage } from "./human-message";

export const PreviousMessages = () => {
  const { store } = useChatContext();
  const messages = store((state) => state.messages);

  const renderMessage = (message: TChatMessage, index: number) => {
    const isLast = (messages?.length || 0) - 1 === index;
    return (
      <div className="flex w-full flex-col items-end gap-1" key={message.id}>
        <HumanMessage chatMessage={message} isLast={isLast} />
        <AIMessage message={message} isLast={isLast} />
      </div>
    );
  };

  const previousMessages = useMemo(() => {
    return messages?.map(renderMessage);
  }, [messages]);

  return previousMessages;
};
