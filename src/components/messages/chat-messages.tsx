import { useSessionsContext } from "@/context/sessions";
import { TChatMessage } from "@/hooks/use-chat-session";
import { useEffect, useRef } from "react";
import { AIMessage } from "./ai-message";
import { HumanMessage } from "./human-message";

export type TMessageListByDate = Record<string, TChatMessage[]>;

export const ChatMessages = () => {
  const { currentSession } = useSessionsContext();
  const chatContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  };

  const renderMessage = (message: TChatMessage, isLast: boolean) => {
    return (
      <div className="flex flex-col gap-1 items-end w-full" key={message.id}>
        <HumanMessage chatMessage={message} isLast={isLast} />
        <AIMessage chatMessage={message} isLast={isLast} />
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
          {currentSession?.messages?.map((message, index) =>
            renderMessage(
              message,
              currentSession?.messages.length - 1 === index
            )
          )}
        </div>
      </div>
    </div>
  );
};
