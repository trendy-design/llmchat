import { useChatContext } from "@/context/chat/context";
import { PromptType, RoleType } from "@/lib/prompts";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Input } from "./ui/input";

export const ChatInput = () => {
  const { sessionId } = useParams();
  const [inputValue, setInputValue] = useState("");
  const { runModel } = useChatContext();

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

  return (
    <div className="w-full flex flex-row absolute bottom-0 px-4 pb-4 pt-16 bg-gradient-to-t from-white from-70% to-white/10 left-0 right-0">
      <Input
        placeholder="Ask AI anything.."
        value={inputValue}
        className="w-full"
        onChange={(e) => {
          setInputValue(e.currentTarget.value);
        }}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
