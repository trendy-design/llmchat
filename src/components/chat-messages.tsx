import { useChatContext } from "@/context/chat/context";
import { PromptProps, TChatMessage } from "@/hooks/use-chat-session";
import { TModelKey } from "@/hooks/use-model-list";
import { ArrowElbowDownRight, Warning } from "@phosphor-icons/react";
import moment from "moment";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { AIMessageBubble } from "./ai-bubble";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export type TRenderMessageProps = {
  id: string;
  humanMessage: string;
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

  const renderMessage = (props: TRenderMessageProps) => {
    return (
      <div className="flex flex-col gap-1 items-end w-full" key={props.id}>
        {props.props?.context && (
          <div className="bg-black/10 text-zinc-600 dark:text-zinc-100 dark:bg-black/30 rounded-2xl p-2 pl-3 text-sm flex flex-row gap-2 pr-4 border hover:border-white/5 border-transparent">
            <ArrowElbowDownRight
              size={20}
              weight="bold"
              className="flex-shrink-0"
            />

            <span className="pt-[0.35em] pb-[0.25em] leading-6">
              {props.props?.context}
            </span>
          </div>
        )}
        {props?.props?.image && (
          <Image
            src={props?.props?.image}
            alt="uploaded image"
            className="rounded-2xl min-w-[120px] h-[120px] border dark:border-white/10 border-black/10 shadow-sm object-cover"
            width={0}
            sizes="50vw"
            height={0}
          />
        )}
        <div className="bg-black/10 text-zinc-600 dark:text-zinc-100 dark:bg-black/30 ml-16 rounded-2xl text-sm flex flex-row gap-2 px-3 py-2">
          <span className="pt-[0.20em] pb-[0.15em] leading-6">
            {props.humanMessage}
          </span>
        </div>

        <AIMessageBubble {...props} />
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
      className="flex flex-col w-full items-center h-screen overflow-y-auto no-scrollbar pt-[60px] pb-[200px]"
      ref={chatContainer}
      id="chat-container"
    >
      <div className="w-[700px] flex flex-col gap-24">
        {/* {messagesByDate &&
          Object.keys(messagesByDate).map((date) => {
            return (
              <div className="flex flex-col" key={date}>
                <LabelDivider label={getRelativeDate(date)} />

                <div className="flex flex-col gap-8 w-full items-start">
                  {messagesByDate[date].map((message) =>
                    renderMessage({
                      id: message.id,
                      humanMessage: message.rawHuman,
                      model: message.model,
                      image: message.image,
                      props: message.props,
                      aiMessage: message.rawAI,
                    })
                  )}
                </div>
              </div>
            );
          })} */}

        <div className="flex flex-col gap-8 w-full items-start">
          {currentSession?.messages?.map((message) =>
            renderMessage({
              id: message.id,
              humanMessage: message.rawHuman,
              model: message.model,
              image: message.image,
              props: message.props,
              aiMessage: message.rawAI,
            })
          )}
        </div>

        {isLastStreamBelongsToCurrentSession &&
          streamingMessage?.props?.query &&
          !streamingMessage?.error &&
          renderMessage({
            id: "streaming",
            humanMessage: streamingMessage?.props?.query,
            aiMessage: streamingMessage?.message,
            image: streamingMessage.props?.image,
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
      </div>
    </div>
  );
};
