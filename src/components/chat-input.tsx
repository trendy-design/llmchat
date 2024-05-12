import { useChatContext } from "@/context/chat/context";
import { PromptType, RoleType } from "@/lib/prompts";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Input } from "./ui/input";

export const ChatInput = () => {
  const { sessionId } = useParams();
  const [inputValue, setInputValue] = useState("");
  const { runModel } = useChatContext();
  return (
    <div className="w-full h-8 flex flex-row bg-gray-100">
      <Input
        placeholder="Ask AI anything.."
        onChange={(e) => {
          setInputValue(e.currentTarget.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            runModel(
              {
                role: RoleType.assistant,
                type: PromptType.ask,
                query: inputValue,
              },
              sessionId.toString()
            );
            e.currentTarget.value = "";
          }
        }}
      />
    </div>
  );
};
