import { useBots } from "@/context/bots/context";
import { useSessionsContext } from "@/context/sessions/provider";
import { TChatMessage } from "@/hooks/use-chat-session";
import { TRunModel } from "@/hooks/use-llm";
import { TModelKey } from "@/hooks/use-model-list";
import { Quotes, TrashSimple } from "@phosphor-icons/react";
import moment from "moment";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { AIMessageBubble } from "./ai-bubble";
import { ChatExamples } from "./chat-examples";
import { GreetingBubble } from "./greeting-bubble";
import { BotAvatar } from "./ui/bot-avatar";
import { Button } from "./ui/button";
import { Type } from "./ui/text";
import { Tooltip } from "./ui/tooltip";

export type TRenderMessageProps = {
  id: string;
  humanMessage?: string;
  props?: TRunModel;
  model: TModelKey;
  image?: string;
  aiMessage?: string;
  loading?: boolean;
};

export type TMessageListByDate = Record<string, TChatMessage[]>;

export const ChatMessages = () => {
  const { currentSession, updateSessionMutation, refetchCurrentSession } =
    useSessionsContext();
  const chatContainer = useRef<HTMLDivElement>(null);
  const { open: openBot } = useBots();

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
        {message.runModelProps?.context && (
          <div className="bg-zinc-50 text-zinc-600 dark:text-zinc-100 dark:bg-black/30 rounded-2xl p-2 pl-3 ml-16 md:ml-32 text-sm md:text-base flex flex-row gap-2 pr-4 border hover:border-white/5 border-transparent">
            <Quotes size={16} weight="bold" className="flex-shrink-0 mt-2" />

            <span className="pt-[0.35em] pb-[0.25em] leading-6">
              {message.runModelProps?.context}
            </span>
          </div>
        )}
        {message?.runModelProps?.image && (
          <Image
            src={message?.runModelProps?.image}
            alt="uploaded image"
            className="rounded-2xl min-w-[120px] h-[120px] border dark:border-white/10 border-black/10 shadow-sm object-cover"
            width={0}
            sizes="50vw"
            height={0}
          />
        )}
        <div className="bg-zinc-50 text-zinc-600 dark:text-zinc-100 dark:bg-black/30 ml-16 md:ml-32 rounded-2xl text-sm md:text-base flex flex-row gap-2 px-3 py-2">
          <span className="pt-[0.20em] pb-[0.15em] leading-6 whitespace-pre-wrap">
            {message.rawHuman}
          </span>
        </div>
        <AIMessageBubble chatMessage={message} isLast={isLast} />
      </div>
    );
  };

  console.log("currentSession bot", currentSession);
  const isFreshSession =
    !currentSession?.messages?.length && !currentSession?.bot;

  return (
    <div
      className="flex flex-col w-full items-center h-[100dvh] overflow-y-auto no-scrollbar pt-[60px] pb-[200px]"
      ref={chatContainer}
      id="chat-container"
    >
      <div className="w-full md:w-[700px] lg:w-[720px] p-2 flex flex-1 flex-col gap-24">
        {isFreshSession && <ChatExamples />}

        {currentSession?.bot && (
          <div className="flex flex-col gap-2 items-center">
            <BotAvatar
              name={currentSession.bot.name}
              size="medium"
              avatar={currentSession?.bot?.avatar}
            />
            <Type size="base" weight="medium" textColor="primary">
              {currentSession.bot.name}
            </Type>
            <Type
              size="xs"
              className="text-center md:max-w-[400px]"
              textColor="tertiary"
            >
              {currentSession.bot.description}
            </Type>
            {!currentSession?.messages?.length && (
              <div className="flex flex-row gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    openBot("public");
                  }}
                >
                  Change Bot
                </Button>
                <Tooltip content="Remove bot">
                  <Button
                    variant="outline"
                    size="iconSm"
                    onClick={() => {
                      updateSessionMutation.mutate(
                        {
                          sessionId: currentSession.id,
                          session: {
                            bot: undefined,
                            updatedAt: moment().toISOString(),
                          },
                        },
                        {
                          onSuccess: () => {
                            refetchCurrentSession?.();
                          },
                        }
                      );
                    }}
                  >
                    <TrashSimple size={16} weight="bold" />
                  </Button>
                </Tooltip>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-8 w-full items-start">
          {currentSession?.bot && <GreetingBubble bot={currentSession?.bot} />}
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
