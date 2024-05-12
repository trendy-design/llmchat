import { useChatContext } from "@/context/chat/context";
import { PromptType, RoleType } from "@/lib/prompts";
import { Command, Plus } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const ChatInput = () => {
  const { sessionId } = useParams();
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const { runModel, createSession, currentSession } = useChatContext();
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

  const isNewSession = !currentSession?.messages?.length;

  const examples = [
    "What is the capital of France?",
    "What is the weather in New York?",
    "What is the population of India?",
    "What is the GDP of China?",
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center absolute bottom-0 px-4 pb-4 pt-16 bg-gradient-to-t from-white dark:from-zinc-800 dark:to-transparent from-70% to-white/10 left-0 right-0">
      {isNewSession && (
        <div className="grid grid-cols-2 gap-2 mb-4 w-[700px]">
          {examples?.map((example, index) => (
            <div
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
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-row items-center px-3 bg-white/10 w-[700px] rounded-2xl">
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
        <Input
          placeholder="Ask AI anything.."
          value={inputValue}
          ref={inputRef}
          onChange={(e) => {
            setInputValue(e.currentTarget.value);
          }}
          onKeyDown={handleKeyDown}
        />
        <Badge>
          <Command size={14} weight="bold" />K
        </Badge>
      </div>
    </div>
  );
};
