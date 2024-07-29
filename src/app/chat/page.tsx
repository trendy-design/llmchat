"use client";
import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/messages";
import { Spinner } from "@/components/ui";
import {
  AssistantsProvider,
  ChatProvider,
  CommandsProvider,
  PromptsProvider,
  useSessions,
} from "@/context";

const ChatSessionPage = () => {
  const { isAllSessionLoading, activeSessionId } = useSessions();

  const renderLoader = () => {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  };

  const isLoading = isAllSessionLoading || !activeSessionId;

  if (isLoading) return renderLoader();

  return (
    <ChatProvider sessionId={activeSessionId}>
      <CommandsProvider>
        <AssistantsProvider>
          <PromptsProvider>
            <div className="relative flex h-[100%] w-full flex-row overflow-hidden bg-zinc-50/20 dark:bg-zinc-800">
              <ChatMessages />
              <ChatInput />
            </div>
          </PromptsProvider>
        </AssistantsProvider>
      </CommandsProvider>
    </ChatProvider>
  );
};

export default ChatSessionPage;
