'use client';
import { ChatInput } from '@/components/chat-input';
import { Thread } from '@/components/thread/thread-combo';
import { useAppStore } from '@/libs/store/app.store';
import { useChatStore } from '@/libs/store/chat.store';
import { Button, Flex, WebsitePreview } from '@repo/ui';
import { IconSettings2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';

const ChatSessionPage = ({
  params,
}: {
  params: { threadId: string }
}) => {
  const router = useRouter();
  const { scrollRef, contentRef } = useStickToBottom({
    stiffness:10,
    damping:0,
  });
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
      <div className='flex flex-col w-full gap-2 overflow-y-auto relative'>
      
      <div className='flex flex-col relative flex-1 overflow-hidden w-full'>
      <div className='flex flex-row items-center justify-between bg-gradient-to-b from-secondary via-secondary/55 to-transparent z-[999] absolute w-full top-0 px-3 pt-2 pb-4'>
   
        <h1 className='text-sm max-w-[300px] truncate font-medium'>{thread?.title ?? 'Untitled'}
{/* 
          <span className='text-xs text-muted-foreground'>{thread?.id}</span>
          <span className='text-xs text-muted-foreground'>{threadItems.length} Items</span> */}
        </h1>
       
       <div className='flex flex-row gap-2'>
        <Button variant="secondary" size='sm' rounded="full" onClick={() => setIsSourcesOpen(prev => !prev)}>
          Sources
        </Button>
        <Button variant="secondary" size='icon-sm' rounded="full" onClick={() => router.push('/settings')}>
          <IconSettings2 size={16} strokeWidth={2} />
        </Button>
        </div>
      </div>
        <Flex className="mx-auto h-full flex-1  w-full px-8 items-center overflow-hidden" direction="col">
          <div className="no-scrollbar flex-1 max-w-3xl overflow-y-auto w-full p-4 overflow-x-hidden" ref={scrollRef}>
            <div ref={contentRef}>
              <Thread />
            </div>
          </div>
          <div className='flex flex-col w-full mx-auto max-w-3xl'>
          <ChatInput showGreeting={false} showBottomBar={false}/>
          </div>
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
