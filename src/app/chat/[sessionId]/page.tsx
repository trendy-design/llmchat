"use client";
import { ChatInput } from "@/components/chat-input";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatMessages } from "@/components/messages/chat-messages";
import { Spinner } from "@/components/ui";
import { useSessions } from "@/context";

const ChatSessionPage = () => {
  const { isAllSessionLoading } = useSessions();

  const renderLoader = () => {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spinner />
      </div>
    );
  };

  const isLoading = isAllSessionLoading;
  return (
    <div className="w-full h-[100%] bg-white dark:bg-zinc-800 flex flex-row relative overflow-hidden">
      <Sidebar />
      {isLoading && renderLoader()}
      {!isLoading && (
        <>
          <ChatMessages />
          <ChatInput />
        </>
      )}
    </div>
  );
};

export default ChatSessionPage;
