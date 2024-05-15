import { useChatContext } from "@/context/chat/context";
import { useFilters } from "@/context/filters/context";
import { useRecordVoice } from "@/hooks/use-record-voice";
import { PromptType, RoleType } from "@/lib/prompts";
import { cn } from "@/lib/utils";
import {
  ArrowElbowDownLeft,
  ClockClockwise,
  Command,
  Microphone,
  Plus,
  StarFour,
  StopCircle,
  X,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ModelSelect } from "./model-select";
import { AudioWaveSpinner } from "./ui/audio-wave";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LabelDivider } from "./ui/label-divider";
import Spinner from "./ui/loading-spinner";

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
  const { open: openFilters } = useFilters();
  const router = useRouter();
  const { startRecording, stopRecording, recording, text, transcribing } =
    useRecordVoice();
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
    {
      title: "Implement JWT Auth for Express.js",
      prompt:
        "Develop a secure user authentication system in a Node.js application using JSON Web Tokens (JWT) for authorization and authentication.",
    },
    {
      title: "The Nature of Reality",
      prompt:
        "Discuss the concept of reality from both a subjective and objective perspective, incorporating theories from famous philosophers.",
    },
    {
      title: "Professional Meeting Follow-Up",
      prompt:
        "Write a follow-up email to a potential employer after a job interview, expressing gratitude for the opportunity and reiterating your interest in the position.",
    },
  ];

  useEffect(() => {
    if (text) {
      setInputValue(text);
      runModel(
        {
          role: RoleType.assistant,
          type: PromptType.ask,
          query: text,
        },
        sessionId.toString()
      );
      setInputValue("");
    }
  }, [text]);

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
            <span className="text-zinc-500">Good morning! 👋 </span>
            <br />
            How can I help you with today? 😊
          </motion.h1>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <motion.div
          variants={slideUpVariant}
          initial={"initial"}
          animate={"animate"}
          className="flex flex-col gap-0 bg-white/10 w-[700px] rounded-[1.25rem]"
        >
          <div className="flex flex-row items-center px-3 h-14  w-full gap-0">
            {isNewSession ? (
              <div className="min-w-8 h-8 flex justify-center items-center">
                <StarFour size={24} weight="fill" />
              </div>
            ) : (
              <Button
                size="icon"
                variant={"ghost"}
                className="min-w-8 h-8"
                onClick={() => {
                  createSession().then((session) => {
                    router.push(`/chat/${session.id}`);
                  });
                }}
              >
                <Plus size={20} weight="bold" />
              </Button>
            )}
            <Input
              placeholder="Ask AI anything ..."
              value={inputValue}
              ref={inputRef}
              autoComplete="off"
              autoCapitalize="off"
              variant="ghost"
              onChange={(e) => {
                setInputValue(e.currentTarget.value);
              }}
              onKeyDown={handleKeyDown}
              className="px-2"
            />
            {recording ? (
              <div className="bg-black/50 rounded-xl px-2 py-1 h-10 flex flex-row items-center">
                <AudioWaveSpinner />
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => {
                    stopRecording();
                  }}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                >
                  <StopCircle
                    size={20}
                    weight="fill"
                    className="text-red-300"
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="iconXS"
                  rounded="default"
                  onClick={() => {
                    stopRecording();
                  }}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                >
                  <X size={12} weight="bold" />
                </Button>
              </div>
            ) : transcribing ? (
              <Spinner />
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="min-w-8 h-8"
                onClick={() => {
                  startRecording();
                  setTimeout(() => {
                    stopRecording();
                  }, 20000);
                }}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
              >
                <Microphone size={20} weight="bold" />
              </Button>
            )}

            <div className="min-w-8 h-8 flex justify-center items-center">
              <ArrowElbowDownLeft size={16} weight="bold" />
            </div>
          </div>
          <div className="flex flex-row items-center w-full justify-start gap-2 p-2">
            <ModelSelect />
            {/* <Button variant="secondary" size="sm">
              <Book size={16} weight="bold" /> Prompts
            </Button>
            <Button variant="secondary" size="sm">
              <GearSix size={16} weight="bold" /> Settings
            </Button> */}
            <div className="flex-1"></div>

            <Button variant="secondary" size="sm" onClick={openFilters}>
              <ClockClockwise size={16} weight="bold" /> History
              <Badge>
                <Command size={12} weight="bold" /> K
              </Badge>
            </Button>
          </div>
        </motion.div>
      </div>
      {isNewSession && (
        <div className="flex flex-col gap-1">
          <LabelDivider
            label={"Examples"}
            className="pt-0"
            transitionDuration={4}
          />
          <div className="grid grid-cols-3 gap-2 w-[700px]">
            {examples?.map((example, index) => (
              <motion.div
                variants={zoomVariant}
                transition={{ delay: 1 }}
                initial={"initial"}
                animate={"animate"}
                className="flex flex-col gap-2 items-start text-sm py-3 px-4 border border-white/5 text-zinc-400 w-full rounded-2xl hover:bg-black/20 hover:scale-[101%] cursor-pointer"
                key={index}
                onClick={() => {
                  runModel(
                    {
                      role: RoleType.assistant,
                      type: PromptType.ask,
                      query: example.prompt,
                    },
                    sessionId.toString()
                  );
                }}
              >
                <p className="text-sm text-white font-semibold w-full">
                  {example.title}
                </p>
                <p className="text-xs text-zinc-500 truncate w-full">
                  {example.prompt}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
