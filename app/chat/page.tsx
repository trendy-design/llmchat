"use client";
import { ChatInput } from "@/components/chat-input";
import { FullPageLoader } from "@/components/full-page-loader";
import { ChatMessages } from "@/components/messages";
import {
  AssistantsProvider,
  ChatProvider,
  CommandsProvider,
  PromptsProvider,
  useSessions,
} from "@/lib/context";

const ChatSessionPage = () => {
  const { activeSessionId } = useSessions();

  if (!activeSessionId) return <FullPageLoader label="Initializing chat" />;

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
