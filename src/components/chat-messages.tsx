import { useChatContext } from "@/context/chat/context";
import { TChatSession, useChatSession } from "@/hooks/use-chat-session";
import { useMarkdown } from "@/hooks/use-mdx";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const ChatMessages = () => {
  const { sessionId } = useParams();
  const { renderMarkdown } = useMarkdown();
  const { lastStream } = useChatContext();
  const [currentSession, setCurrentSession] = useState<
    TChatSession | undefined
  >();
  const chatContainer = useRef<HTMLDivElement>(null);
  const { getSessionById } = useChatSession();

  const fetchSession = async () => {
    getSessionById(sessionId.toString()).then((session) => {
      setCurrentSession(session);
    });
  };

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession]);

  const scrollToBottom = () => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!lastStream) {
      fetchSession();
    } else {
      scrollToBottom();
    }
  }, [lastStream]);

  const isLastStreamBelongsToCurrentSession =
    lastStream?.sessionId === sessionId;

  return (
    <div
      className="flex flex-col w-full items-center h-screen overflow-y-auto pb-[200px]"
      ref={chatContainer}
    >
      <div className="max-w-[500px] flex flex-col gap-4">
        {currentSession?.messages.map((message) => (
          <div className="p-2" key={message.id}>
            {message.rawHuman}
            {renderMarkdown(message.rawAI)}
          </div>
        ))}
        {isLastStreamBelongsToCurrentSession && (
          <div className="p-2">
            {lastStream?.props?.query}
            {renderMarkdown(lastStream.messgae)}
          </div>
        )}
      </div>
    </div>
  );
};
