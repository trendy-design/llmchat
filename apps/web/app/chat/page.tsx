'use client';
import { ChatInput } from '@/components/chat-input';
import { Thread } from '@/components/thread/thread-combo';
import { useChatStore } from '@/libs/store/chat.store';
import { Flex } from '@repo/ui';
import { useEffect } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';

const ChatSessionPage = () => {
  const currentThreadId = useChatStore(state => state.currentThreadId);
  const switchThread = useChatStore(state => state.switchThread);
  const { scrollRef, contentRef } = useStickToBottom();

  useEffect(() => {
    if (currentThreadId) {
      switchThread(currentThreadId);
    }
  }, []);

  return (
    <Flex className="mx-auto h-full w-full max-w-2xl items-center" direction="col">
      <div className="no-scrollbar w-full flex-1 overflow-y-auto overflow-x-hidden" ref={scrollRef}>
        <div ref={contentRef}>
          <Thread />
        </div>
      </div>
      <ChatInput />
    </Flex>
  );
};

export default ChatSessionPage;
