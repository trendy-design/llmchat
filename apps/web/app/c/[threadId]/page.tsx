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
        <Flex className="h-full w-full flex-1 items-center px-8" direction="col">
            <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-[200px]" ref={scrollRef}>
                <div ref={contentRef}>
                    <Thread />
                </div>
            </div>

            <div className="bg-secondary fixed bottom-0 z-[30] mx-auto flex w-full max-w-3xl flex-col">
                <ChatInput showGreeting={false} showBottomBar={false} isFollowUp={true} />
            </div>
        </Flex>
    );
};

export default ChatSessionPage;
