'use client';
import { ChatInput } from '@/components/chat-input';
import { Thread } from '@/components/thread/thread-combo';
import { useChatStore } from '@/libs/store/chat.store';
import { Button, Flex, WebsitePreview } from '@repo/ui';
import { useEffect } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';

const ChatSessionPage = () => {
  const currentThreadId = useChatStore(state => state.currentThreadId);
  const switchThread = useChatStore(state => state.switchThread);
  const { scrollRef, contentRef } = useStickToBottom();
  const currentSources = useChatStore(state => state.currentSources);
  const thread = useChatStore(state => state.currentThread);
  useEffect(() => {
    if (currentThreadId) {
      switchThread(currentThreadId);
    }
  }, []);

  return (
    <div className='flex flex-col h-full w-full'>
      <div className='flex flex-row items-center justify-between px-4 py-1.5 border-b border-soft'>
        <h1 className='text-sm font-medium'>{thread?.title ?? 'Untitled'}</h1>
        <Button variant='ghost' size='sm'>
          Share
        </Button>
      </div>
    <div className='flex flex-row flex-1 overflow-hidden w-full'>
    <Flex className="mx-auto h-full flex-1 max-w-2xl items-center" direction="col">
      <div className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden" ref={scrollRef}>
        <div ref={contentRef}>
          <Thread />
        </div>
      </div>
      <ChatInput />
   
    </Flex>
       <div className='flex flex-col shrink-0 gap-2 w-[360px] p-8 h-full border-border'> 
        {
          currentSources.map(source => (
            <WebsitePreview key={source} url={source} />
          ))
        }
       </div>
       </div>
       </div>
  );
};

export default ChatSessionPage;
