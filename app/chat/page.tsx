"use client";
import { ChatInput } from "@/components/chat-input";
import { ChatTopActions } from "@/components/chat-input/chat-top-actions";
import { ChatMessages } from "@/components/messages";
import { ChatProvider, PromptsProvider, useSessions } from "@/lib/context";
import { Flex } from "@/ui";

const ChatSessionPage = () => {
  const { activeSessionId } = useSessions();

  return (
    <ChatProvider sessionId={activeSessionId}>
      <PromptsProvider>
        <Flex className="w-full" direction="col">
          <Flex
            direction="row"
            className="absolute top-0 z-20 w-full rounded-t-md border-b border-zinc-500/10 bg-white dark:bg-zinc-800"
          >
            <ChatTopActions />
          </Flex>
          <ChatMessages />
          <ChatInput />
        </Flex>
      </PromptsProvider>
    </ChatProvider>
  );
};

export default ChatSessionPage;
