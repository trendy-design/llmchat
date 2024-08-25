"use client";
import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/messages";
import {
  AssistantsProvider,
  ChatProvider,
  CommandsProvider,
  PromptsProvider,
  useSessions,
} from "@/lib/context";
import { Spinner } from "@/ui";

const ChatSessionPage = () => {
  const { isAllSessionLoading, activeSessionId } = useSessions();

  const renderLoader = () => {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
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
            <div className="relative flex h-[100%] w-full flex-row overflow-hidden">
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
