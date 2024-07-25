import { useChatContext } from "@/context";
import { TChatMessage } from "@/types";
import { useEffect, useRef } from "react";
import { AIMessage } from "./ai/ai-message";
import { HumanMessage } from "./human-message";

export type TMessageListByDate = Record<string, TChatMessage[]>;

export const ChatMessages = () => {
  const { store } = useChatContext();
  const session = store((state) => state.session);
  const messages = store((state) => state.messages);
  const isGenerating = store((state) => state.isGenerating);
  const chatContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isUserNearBottom()) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages?.length]);

  function isUserNearBottom() {
    var scrollThreshold = 50;
    if (chatContainer.current) {
      // Adjust this value as needed
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

  const renderMessage = (message: TChatMessage, isLast: boolean) => {
    return (
      <div className="flex flex-col gap-1 items-end w-full" key={message.id}>
        <HumanMessage chatMessage={message} isLast={isLast} />
        <AIMessage message={message} isLast={isLast} />
      </div>
    );
  };

  return (
    <div
      className="flex flex-col w-full items-center h-[100dvh] overflow-y-auto no-scrollbar pt-[60px] pb-[200px]"
      ref={chatContainer}
      id="chat-container"
    >
      <div className="w-full md:w-[700px] lg:w-[720px] p-2 flex flex-1 flex-col gap-24">
        <div className="flex flex-col gap-8 w-full items-start">
          {messages?.map((message, index) =>
            renderMessage(message, messages.length - 1 === index)
          )}
        </div>
      </div>
    </div>
  );
};
