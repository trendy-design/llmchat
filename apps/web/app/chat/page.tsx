'use client';
import { ChatInput } from '@/components/chat-input';
import { Thread } from '@/components/thread/thread-combo';
import { useChatStore } from '@/libs/store/chat.store';
import { Flex, WebsitePreview } from '@repo/ui';
import { useEffect } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';

const ChatSessionPage = () => {
  const currentThreadId = useChatStore(state => state.currentThreadId);
  const switchThread = useChatStore(state => state.switchThread);
  const { scrollRef, contentRef } = useStickToBottom();
  const currentSources = useChatStore(state => state.currentSources);

  useEffect(() => {
    if (currentThreadId) {
      switchThread(currentThreadId);
    }
  }, []);

  return (
    <div className='flex flex-row h-full w-full'>
    <Flex className="mx-auto h-full w-full max-w-2xl items-center" direction="col">
      <div className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden" ref={scrollRef}>
        <div ref={contentRef}>
          <Thread />
        </div>
      </div>
      <ChatInput />
   
    </Flex>
       <div className='flex flex-col gap-2 w-[400px] p-8 h-full border-border'> 
        {
          currentSources.map(source => (
            <WebsitePreview key={source} url={source} />
          ))
        }
       </div>
       </div>
  );
};

export default ChatSessionPage;
