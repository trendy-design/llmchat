'use client';
import { ChatInput } from '@/components/chat-input';
import { Thread } from '@/components/thread/thread-combo';
import { useChatStore } from '@/libs/store/chat.store';
import { Flex } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';

const ChatSessionPage = ({ params }: { params: { threadId: string } }) => {
    const router = useRouter();
    const { scrollRef, contentRef } = useStickToBottom({
        stiffness: 10,
        damping: 0,
    });
    const switchThread = useChatStore(state => state.switchThread);
    const getThread = useChatStore(state => state.getThread);

    useEffect(() => {
        const { threadId } = params;
        if (!threadId) {
            return;
        }
        getThread(threadId).then(thread => {
            if (thread?.id) {
                switchThread(thread.id);
            } else {
                router.push('/chat');
            }
        });
    }, [params]);

    return (
        <div className="flex h-full w-full flex-row">
            <div className="relative flex w-full flex-col gap-2 overflow-y-auto">
                <div className="relative flex w-full flex-1 flex-col overflow-hidden">
                    {/* <div className='flex flex-row items-center justify-between bg-gradient-to-b from-secondary via-secondary/55 to-transparent z-[999] absolute w-full top-0 px-3 pt-2 pb-4'>
   
        <h1 className='text-sm max-w-[300px] truncate font-medium'>{thread?.title ?? 'Untitled'}

        </h1>
       
       <div className='flex flex-row gap-2'>
    
        <Button variant="secondary" size='icon-sm' rounded="full" onClick={() => router.push('/settings')}>
          <IconSettings2 size={16} strokeWidth={2} />
        </Button>
        </div>
      </div> */}
                    <Flex
                        className="mx-auto h-full w-full flex-1 items-center overflow-hidden px-8"
                        direction="col"
                    >
                        <div
                            className="no-scrollbar w-full max-w-3xl flex-1 overflow-y-auto overflow-x-hidden px-4"
                            ref={scrollRef}
                        >
                            <div ref={contentRef}>
                                <Thread />
                            </div>
                        </div>
                        <div className="mx-auto flex w-full max-w-3xl flex-col">
                            <ChatInput
                                showGreeting={false}
                                showBottomBar={false}
                                isFollowUp={true}
                            />
                        </div>
                    </Flex>
                </div>
            </div>
        </div>
    );
};

export default ChatSessionPage;
