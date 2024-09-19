"use client";
import { ChatInput } from "@/components/chat-input";
import { FullPageLoader } from "@/components/full-page-loader";
import { ChatMessages } from "@/components/messages";
import { ChatProvider, PromptsProvider, useSessions } from "@/lib/context";
import { Flex } from "@/ui";

const ChatSessionPage = () => {
  const { activeSessionId } = useSessions();

  return (
    <ChatProvider sessionId={activeSessionId}>
      <PromptsProvider>
        {activeSessionId ? (
          <Flex className="w-full" direction="col">
            <ChatMessages />
            <ChatInput />
          </Flex>
        ) : (
          <FullPageLoader label="Initializing chat" />
        )}
      </PromptsProvider>
    </ChatProvider>
  );
};

export default ChatSessionPage;
