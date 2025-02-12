"use client";
import { ChatInput } from "@/components/chat-input";
import { ChatTopNav } from "@/components/chat-input/chat-top-nav";
import { ChatMessages } from "@/components/messages";
import { ChatProvider, PromptsProvider, useSessions } from "@/lib/context";
import { Flex } from "@repo/ui";

const ChatSessionPage = () => {
  const { activeSessionId } = useSessions();

  return (
    <ChatProvider sessionId={activeSessionId}>
      <PromptsProvider>
        <Flex className="w-full" direction="col">
          <ChatTopNav />
          <ChatMessages />
          <ChatInput />
        </Flex>
      </PromptsProvider>
    </ChatProvider>
  );
};

export default ChatSessionPage;
