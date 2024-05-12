"use client";
import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/chat-messages";
import { useParams } from "next/navigation";

const chatSessionPage = () => {
  const { sessionId } = useParams();
  return (
    <div className="w-full h-screen flex flex-row">
      <ChatMessages />
      <ChatInput />
    </div>
  );
};

export default chatSessionPage;
