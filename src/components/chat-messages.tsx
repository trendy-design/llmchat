import { useChatContext } from "@/context/chat/context";
import { useMarkdown } from "@/hooks/use-mdx";
import { TModelKey } from "@/hooks/use-model-list";
import { Warning } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Avatar } from "./ui/avatar";
import Spinner from "./ui/loading-spinner";

export type TRenderMessageProps = {
  key: string;
  humanMessage: string;
  model: TModelKey;
  aiMessage?: string;
  loading?: boolean;
};

export const ChatMessages = () => {
  const { renderMarkdown } = useMarkdown();
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
    const { key, humanMessage, aiMessage, loading, model } = porps;
    return (
      <div className="flex flex-col gap-1 items-start w-full" key={key}>
        <div className="flex flex-row justify-end w-full">
          <motion.div
            className="bg-black/30 rounded-2xl p-2 text-sm flex flex-row gap-2 pl-4 border border-white/5"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,

              transition: { duration: 1, ease: "easeInOut" },
            }}
          >
            <span className="pt-1.5 leading-5 text-right">{humanMessage}</span>
            <Avatar name="Deep" />
          </motion.div>
        </div>
        <motion.div
          className="bg-white/5 rounded-2xl p-4 w-full border border-white/5 flex flex-col items-start"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 1, ease: "easeInOut" },
          }}
        >
          {aiMessage && renderMarkdown(aiMessage, key === "streaming")}
          {loading && <Spinner />}
        </motion.div>
        <motion.p
          className="text-zinc-500 text-xs py-1/2 px-2"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: 1, ease: "easeInOut" },
          }}
        >
          {model}
        </motion.p>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col w-full items-center h-screen overflow-y-auto pt-[60px] pb-[200px]"
      ref={chatContainer}
    >
      <motion.div
        className="w-[600px] flex flex-col gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 1, ease: "easeInOut" } }}
      >
        {currentSession?.messages.map((message) =>
          renderMessage({
            key: message.id,
            humanMessage: message.rawHuman,
            model: message.model,
            aiMessage: message.rawAI,
          })
        )}
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
