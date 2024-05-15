import { useChatContext } from "@/context/chat/context";
import { TChatMessage } from "@/hooks/use-chat-session";
import { TModelKey } from "@/hooks/use-model-list";
import { getRelativeDate } from "@/lib/date";
import { Warning } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import moment from "moment";
import { useEffect, useRef } from "react";
import { AIMessageBubble } from "./ai-bubble";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Avatar } from "./ui/avatar";
import { LabelDivider } from "./ui/label-divider";

export type TRenderMessageProps = {
  key: string;
  humanMessage: string;
  model: TModelKey;
  aiMessage?: string;
  loading?: boolean;
};

export type TMessageListByDate = Record<string, TChatMessage[]>;

moment().calendar(null, {
  sameDay: "[Today]",
  nextDay: "[Tomorrow]",
  nextWeek: "dddd",
  lastDay: "[Yesterday]",
  lastWeek: "[Last] dddd",
  sameElse: "DD/MM/YYYY",
});

export const ChatMessages = () => {
  const { streamingMessage, currentSession } = useChatContext();
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
    if (streamingMessage) {
      scrollToBottom();
    }
  }, [streamingMessage]);

  const isLastStreamBelongsToCurrentSession =
    streamingMessage?.sessionId === currentSession?.id;

  const renderMessage = (porps: TRenderMessageProps) => {
    const { key, humanMessage } = porps;

    return (
      <div className="flex flex-col gap-1 items-start w-full" key={key}>
        <motion.div
          className="bg-black/30 rounded-2xl p-2 text-sm flex flex-row gap-2 pr-4 border border-white/5"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: 1, ease: "easeInOut" },
          }}
        >
          <Avatar name="Deep" />
          <span className="pt-[0.35em] pb-[0.25em] leading-6">
            {humanMessage}
          </span>
        </motion.div>
        <AIMessageBubble {...porps} />
      </div>
    );
  };

  // group messages by createdAt date by days
  const messagesByDate = currentSession?.messages.reduce(
    (acc: TMessageListByDate, message) => {
      const date = moment(message.createdAt).format("YYYY-MM-DD");
      if (!acc?.[date]) {
        acc[date] = [message];
      } else {
        acc[date] = [...acc[date], message];
      }
      return acc;
    },
    {}
  );

  console.log(messagesByDate);

  return (
    <div
      className="flex flex-col w-full items-center h-screen overflow-y-auto pt-[60px] pb-[200px]"
      ref={chatContainer}
      id="chat-container"
    >
      <motion.div
        className="w-[620px] flex flex-col gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 1, ease: "easeInOut" } }}
      >
        {messagesByDate &&
          Object.keys(messagesByDate).map((date) => {
            return (
              <div className="flex flex-col" key={date}>
                <LabelDivider label={getRelativeDate(date)} />

                <div className="flex flex-col gap-4 w-full items-start">
                  {messagesByDate[date].map((message) =>
                    renderMessage({
                      key: message.id,
                      humanMessage: message.rawHuman,
                      model: message.model,
                      aiMessage: message.rawAI,
                    })
                  )}
                </div>
              </div>
            );
          })}

        {isLastStreamBelongsToCurrentSession &&
          streamingMessage?.props?.query &&
          !streamingMessage?.error &&
          renderMessage({
            key: "streaming",
            humanMessage: streamingMessage?.props?.query,
            aiMessage: streamingMessage?.message,
            model: streamingMessage?.model,
            loading: streamingMessage?.loading,
          })}

        {streamingMessage?.error && (
          <Alert variant="destructive">
            <Warning size={20} weight="bold" />
            <AlertTitle>Ahh! Something went wrong!</AlertTitle>
            <AlertDescription>{streamingMessage?.error}</AlertDescription>
          </Alert>
        )}
      </motion.div>
    </div>
  );
};
