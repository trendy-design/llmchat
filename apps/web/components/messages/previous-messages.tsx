import { useChatContext } from "@/lib/context";
import { useScrollToBottom } from "@/lib/hooks";
import { TChatMessage } from "@repo/shared/types";
import { useMemo } from "react";
import { Message } from "./message";

export const PreviousMessages = () => {
  const { store } = useChatContext();
  const messages = store((state) => state.messages) || [];
  const isStopped = store((state) => state.currentMessage?.stop);
  const hasCurrentMessage = store((state) => !!state.currentMessage);
  const { scrollToBottom } = useScrollToBottom();

  const renderMessage = (message: TChatMessage, index: number) => {
    const isLast = !hasCurrentMessage && messages.length - 1 === index;
    return <Message message={message} isLast={isLast} key={message.id} />;
  };

  // useEffect(() => {
  //   if (messages?.length) {
  //     scrollToBottom();
  //   }
  // }, [messages.length]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
const  previousMessages = useMemo(() => {
    return messages.map(renderMessage);
  }, [messages, isStopped]);

  return previousMessages;
};
