'use client';
import { ChatInput, Thread } from '@repo/common/components';
import { useChatStore } from '@repo/common/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';

const ChatSessionPage = ({ params }: { params: { threadId: string } }) => {
    const router = useRouter();
    const { scrollRef, contentRef } = useStickToBottom({
        stiffness: 1,
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
        <div
            className="flex h-full w-full flex-col items-center overflow-y-auto px-8"
            ref={scrollRef}
        >
            <div className="mx-auto w-full max-w-3xl px-4 pb-[200px] pt-8" ref={contentRef}>
                <Thread />
            </div>

            <div className="bg-secondary fixed bottom-0 z-[30] mx-auto flex w-full max-w-3xl flex-col">
                <ChatInput showGreeting={false} showBottomBar={false} isFollowUp={true} />
            </div>
        </div>
    );
};

export default ChatSessionPage;
