"use client";
import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/chat-messages";
import { useParams } from "next/navigation";

const chatSessionPage = () => {
  const { sessionId } = useParams();

  return (
    <div className="w-full h-screen flex flex-row relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b dark:from-zinc-800 dark:to-transparent from-70% to-white/10 z-10"></div>
      <ChatMessages />
      <ChatInput />
    </div>
  );
};

export default chatSessionPage;
