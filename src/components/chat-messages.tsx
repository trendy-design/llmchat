import { useChatContext } from "@/context/chat/context";
import { useMarkdown } from "@/hooks/use-mdx";
import { Warning } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Avatar } from "./ui/avatar";

export const ChatMessages = () => {
  const { renderMarkdown } = useMarkdown();
  const { lastStream, currentSession, error } = useChatContext();
  const chatContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession]);

  const scrollToBottom = () => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (lastStream) {
      scrollToBottom();
    }
  }, [lastStream]);

  const isLastStreamBelongsToCurrentSession =
    lastStream?.sessionId === currentSession?.id;

  const renderMessage = (
    key: string,
    humanMessgae: string,
    aiMessage: string
  ) => {
    return (
      <div className="flex flex-col gap-1 items-start w-full" key={key}>
        <div className="bg-black/30 rounded-2xl p-2 text-sm flex flex-row gap-2 pr-4 border border-white/5">
          <Avatar name="Deep" />
          <span className="pt-1 leading-5">{humanMessgae}</span>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 w-full border border-white/5">
          {renderMarkdown(aiMessage)}
        </div>
      </div>
    );
  };

  console.log("err", error);

  return (
    <div
      className="flex flex-col w-full items-center h-screen overflow-y-auto pt-[60px] pb-[200px]"
      ref={chatContainer}
    >
      <div className="w-[600px] flex flex-col gap-8">
        {currentSession?.messages.map((message) =>
          renderMessage(message.id, message.rawHuman, message.rawAI)
        )}
        {isLastStreamBelongsToCurrentSession &&
          lastStream?.props?.query &&
          renderMessage("last", lastStream?.props?.query, lastStream?.messgae)}
        {error && (
          <Alert variant="destructive">
            <Warning size={20} weight="bold" />
            <AlertTitle>Ahh! Something went wrong!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
