'use client';
import { ChatInput } from '@/components/chat-input';
import { Thread } from '@/components/thread/thread-combo';
import { useAppStore } from '@/libs/store/app.store';
import { useChatStore } from '@/libs/store/chat.store';
import { Button, Flex, WebsitePreview } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';

const ChatSessionPage = ({
  params,
}: {
  params: { threadId: string }
}) => {
  const router = useRouter();
  const { scrollRef, contentRef } = useStickToBottom();
  const currentSources = useChatStore(state => state.currentSources);
  const threadItems = useChatStore(state => state.threadItems);
  const setIsSourcesOpen = useAppStore(state => state.setIsSourcesOpen);
  const isSourcesOpen = useAppStore(state => state.isSourcesOpen);
  const switchThread = useChatStore(state => state.switchThread);
  const thread = useChatStore(state => state.currentThread);
  const getThread = useChatStore(state => state.getThread);

  useEffect(() => {
    const { threadId } = params;
    if(!threadId) {
      return;
    }
    getThread(threadId).then(thread => {
      if(thread?.id) {
        switchThread(thread.id);
      }
      else {
        router.push('/chat');
      }
    });
  }, [params]);


  return (
    <div className='flex flex-row h-full w-full'>
      <div className='flex flex-col w-full gap-2 overflow-y-auto h-[98dvh] border border-border rounded-md my-2 mr-2 bg-background dark:bg-secondary'>
      <div className='flex flex-row items-center justify-between px-1.5 py-1.5 border-b border-soft'>
      <Button variant='ghost' size='sm'>
          Share
        </Button>
        <h1 className='text-sm max-w-[300px] truncate text-muted-foreground'>{thread?.title ?? 'Untitled'}

          <span className='text-xs text-muted-foreground'>{thread?.id}</span>
          <span className='text-xs text-muted-foreground'>{threadItems.length} Items</span>
        </h1>
       
        <Button variant='ghost' size='sm' onClick={() => setIsSourcesOpen(prev => !prev)}>
          Sources
        </Button>
      </div>
      <div className='flex flex-row flex-1 overflow-hidden w-full'>
        <Flex className="mx-auto h-full flex-1 max-w-2xl items-center overflow-hidden" direction="col">
          <div className="no-scrollbar flex-1 overflow-y-auto w-full p-4 overflow-x-hidden" ref={scrollRef}>
            <div ref={contentRef}>
              <Thread />
            </div>
          </div>
          <ChatInput showGreeting={false}/>

        </Flex>
       
      </div>
      </div>
      {isSourcesOpen && <div className='flex flex-col shrink-0 gap-2 w-[280px] overflow-y-auto h-full '>
      { currentSources?.length > 0 && <div className='flex flex-col shrink-0 gap-2 w-full overflow-y-auto p-2 h-full border-border'>
          {
            currentSources.map(source => (
              <WebsitePreview key={source} url={source} />
            ))
          }
        </div>}
        </div>}
    </div>
  );
};

export default ChatSessionPage;
