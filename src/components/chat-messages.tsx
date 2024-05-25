import { useChatContext } from "@/context/chat/context";
import { PromptProps, TChatMessage } from "@/hooks/use-chat-session";
import { TModelKey } from "@/hooks/use-model-list";
import { removeExtraSpaces } from "@/lib/helper";
import { ArrowElbowDownRight } from "@phosphor-icons/react";
import moment from "moment";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { AIMessageBubble } from "./ai-bubble";

export type TRenderMessageProps = {
  id: string;
  humanMessage?: string;
  props?: PromptProps;
  model: TModelKey;
  image?: string;
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
  const { currentSession, runModel } = useChatContext();
  const chatContainer = useRef<HTMLDivElement>(null);

  const isNewSession = currentSession?.messages.length === 0;

  useEffect(() => {
    scrollToBottom();
  }, [currentSession]);

  const scrollToBottom = () => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  };

  const renderMessage = (message: TChatMessage, isLast: boolean) => {
    return (
      <div className="flex flex-col gap-1 items-end w-full" key={message.id}>
        {message.props?.context && (
          <div className="bg-zinc-50 text-zinc-600 dark:text-zinc-100 dark:bg-black/30 rounded-2xl p-2 pl-3 text-sm md:text-base flex flex-row gap-2 pr-4 border hover:border-white/5 border-transparent">
            <ArrowElbowDownRight
              size={20}
              weight="bold"
              className="flex-shrink-0"
            />

            <span className="pt-[0.35em] pb-[0.25em] leading-6">
              {message.props?.context}
            </span>
          </div>
        )}
        {message?.props?.image && (
          <Image
            src={message?.props?.image}
            alt="uploaded image"
            className="rounded-2xl min-w-[120px] h-[120px] border dark:border-white/10 border-black/10 shadow-sm object-cover"
            width={0}
            sizes="50vw"
            height={0}
          />
        )}
        <div className="bg-zinc-50 text-zinc-600 dark:text-zinc-100 dark:bg-black/30 ml-16 rounded-2xl text-sm md:text-base flex flex-row gap-2 px-3 py-2">
          <span className="pt-[0.20em] pb-[0.15em] leading-6 whitespace-pre-wrap">
            {removeExtraSpaces(message.rawHuman)}
          </span>
        </div>
        <AIMessageBubble chatMessage={message} isLast={isLast} />
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

  return (
    <div
      className="flex flex-col w-full items-center h-[100dvh] overflow-y-auto no-scrollbar pt-[60px] pb-[200px]"
      ref={chatContainer}
      id="chat-container"
    >
      <div className="w-full md:w-[700px] p-4 flex flex-col gap-24">
        <div className="flex flex-col gap-8 w-full items-start">
          {currentSession?.messages?.map((message, index) =>
            renderMessage(
              message,
              currentSession?.messages.length - 1 === index
            )
          )}
        </div>

        {/* {streamingMessage?.error && (
          <Alert variant="destructive">
            <Warning size={20} weight="bold" />
            <AlertTitle>Ahh! Something went wrong!</AlertTitle>
            <AlertDescription>{streamingMessage?.error}</AlertDescription>
          </Alert>
        )} */}
      </div>
    </div>
  );
};
