"use client";
import { ChatInput } from "@/components/chat-input";
import { ChatTopNav } from "@/components/chat-input/chat-top-nav";
import { ChatMessages } from "@/components/messages";
import { ChatProvider, PromptsProvider, useSessions } from "@/lib/context";
import { Flex } from "@/ui";
import { useEffect } from "react";

const ChatSessionPage = () => {
  const { activeSessionId, createSession } = useSessions();

  useEffect(() => {
    if (!activeSessionId) {
      createSession();
    }
  }, [activeSessionId]);

  return (
    <ChatProvider sessionId={activeSessionId}>
      <PromptsProvider>
        <Flex className="w-full" direction="col">
          <Flex
            direction="row"
            className="absolute top-0 z-20 w-full rounded-t-md border-b border-zinc-500/10 bg-zinc-25 dark:bg-zinc-800"
          >
            <ChatTopNav />
          </Flex>
          <ChatMessages />
          <ChatInput />
        </Flex>
      </PromptsProvider>
    </ChatProvider>
  );
};

export default ChatSessionPage;
