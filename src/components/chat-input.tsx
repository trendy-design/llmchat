import { useChatContext } from "@/context/chat/context";
import { PromptType, RoleType } from "@/lib/prompts";
import { cn } from "@/lib/utils";
import { ArrowElbowDownLeft, Plus, Sparkle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const slideUpVariant = {
  initial: { y: 50, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

const zoomVariant = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut", delay: 1 },
  },
};

export const ChatInput = () => {
  const { sessionId } = useParams();
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const { runModel, createSession, currentSession, streamingMessage } =
    useChatContext();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runModel(
        {
          role: RoleType.assistant,
          type: PromptType.ask,
          query: inputValue,
        },
        sessionId.toString()
      );
      setInputValue("");
    }
  };

  useEffect(() => {
    if (sessionId) {
      inputRef.current?.focus();
    }
  }, [sessionId]);

  const isNewSession =
    !currentSession?.messages?.length && !streamingMessage?.loading;

  const examples = [
    "What is the capital of France?",
    "What is the weather in New York?",
    "What is the population of India?",
    "What is the GDP of China?",
  ];

  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center absolute bottom-0 px-4 pb-4 pt-16 bg-gradient-to-t transition-all ease-in-out duration-1000 from-white dark:from-zinc-800 dark:to-transparent from-70% to-white/10 left-0 right-0 gap-6",
        isNewSession && "top-0"
      )}
    >
      {isNewSession && (
        <div className="flex flex-row items-center w-[680px] justify-start gap-2">
          <motion.h1
            className="text-2xl font-semibold tracking-tight text-zinc-100"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                duration: 1,
              },
            }}
          >
            <span className="text-zinc-500">Hello! 👋 </span>
            <br />
            What can I help you with today? 😊
          </motion.h1>
        </div>
      )}
      <motion.div
        variants={slideUpVariant}
        initial={"initial"}
        animate={"animate"}
        className="flex flex-row items-center px-3 bg-white/10 w-[700px] rounded-2xl"
      >
        {isNewSession ? (
          <div className="min-w-8 h-8 flex justify-center items-center">
            <Sparkle size={24} weight="fill" />
          </div>
        ) : (
          <Button
            size="icon"
            className="min-w-8 h-8"
            onClick={() => {
              createSession().then((session) => {
                router.push(`/chat/${session.id}`);
              });
            }}
          >
            <Plus size={16} weight="bold" />
          </Button>
        )}
        <Input
          placeholder="Ask AI anything.."
          value={inputValue}
          ref={inputRef}
          autoComplete="off"
          autoCapitalize="off"
          variant="ghost"
          onChange={(e) => {
            setInputValue(e.currentTarget.value);
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="min-w-8 h-8 flex justify-center items-center">
          <ArrowElbowDownLeft size={16} weight="bold" />
        </div>
      </motion.div>
      {isNewSession && (
        <div className="grid grid-cols-2 gap-2 w-[700px]">
          {examples?.map((example, index) => (
            <motion.div
              variants={zoomVariant}
              transition={{ delay: 1 }}
              initial={"initial"}
              animate={"animate"}
              className="flex flex-row items-center text-sm py-3 px-4 bg-black/10 border border-white/5 text-zinc-400 w-full rounded-2xl hover:bg-black/20 hover:scale-[101%] cursor-pointer"
              key={index}
              onClick={() => {
                runModel(
                  {
                    role: RoleType.assistant,
                    type: PromptType.ask,
                    query: example,
                  },
                  sessionId.toString()
                );
              }}
            >
              {example}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
