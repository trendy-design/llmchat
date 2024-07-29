import { useChatContext } from "@/context";
import { TChatMessage } from "@/types";
import { useEffect, useRef } from "react";
import { AIMessage } from "./ai/ai-message";
import { HumanMessage } from "./human-message";

export const ChatMessages = () => {
  const { store } = useChatContext();
  const messages = store((state) => state.messages);
  const chatContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isUserNearBottom()) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages?.length, messages?.[messages.length - 1]?.relatedQuestions]);

  function isUserNearBottom() {
    var scrollThreshold = 100;
    if (chatContainer.current) {
      return (
        chatContainer.current.scrollHeight - chatContainer.current.scrollTop <=
        chatContainer.current.clientHeight + scrollThreshold
      );
    }
  }

  const scrollToBottom = () => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  };

  const renderMessage = (message: TChatMessage, index: number) => {
    const isLast = (messages?.length || 0) - 1 === index;
    return (
      <div className="flex w-full flex-col items-end gap-1" key={message.id}>
        <HumanMessage chatMessage={message} isLast={isLast} />
        <AIMessage message={message} isLast={isLast} />
      </div>
    );
  };

  return (
    <div
      className="no-scrollbar flex h-[100dvh] w-full flex-col items-center overflow-y-auto pb-[200px] pt-[60px]"
      ref={chatContainer}
      id="chat-container"
    >
      <div className="flex w-full flex-1 flex-col gap-24 p-2 md:w-[700px] lg:w-[720px]">
        <div className="flex w-full flex-col items-start gap-8">
          {messages?.map(renderMessage)}
        </div>
      </div>
    </div>
  );
};
