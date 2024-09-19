"use client";
import { ChatInput } from "@/components/chat-input";
import { FullPageLoader } from "@/components/full-page-loader";
import { ChatMessages } from "@/components/messages";
import {
  AssistantsProvider,
  ChatProvider,
  PromptsProvider,
  useSessions,
} from "@/lib/context";
import { Flex } from "@/ui";

const ChatSessionPage = () => {
  const { activeSessionId } = useSessions();

  return (
    <ChatProvider sessionId={activeSessionId}>
      <AssistantsProvider>
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
      </AssistantsProvider>
    </ChatProvider>
  );
};

export default ChatSessionPage;
