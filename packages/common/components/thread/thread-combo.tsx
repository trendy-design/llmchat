import { ThreadItem } from '@repo/common/components';
import { useIsMobile } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import { cn } from '@repo/ui';
import { useParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function Thread() {
    const { threadId } = useParams();
    const isMobile = useIsMobile();
    const currentThreadId = threadId?.toString() ?? '';
    const previousThreadItems = useChatStore(
        useShallow(state => state.getPreviousThreadItems(currentThreadId))
    );
    const currentThreadItem = useChatStore(
        useShallow(state => state.getCurrentThreadItem(currentThreadId))
    );
    const memoizedPreviousThreadItems = useMemo(() => {
        return previousThreadItems.map(threadItem => (
            <div key={threadItem.id}>
                <ThreadItem
                    key={threadItem.id}
                    threadItem={threadItem}
                    isAnimated={false}
                    isLast={false}
                />
            </div>
        ));
    }, [previousThreadItems]);

    useEffect(() => {
        console.log('currentThreadItem', currentThreadId, previousThreadItems, currentThreadItem);
    }, [currentThreadId, previousThreadItems, currentThreadItem]);

    return (
        <div className="relative" id="thread-container">
            <div className={cn('flex min-w-full flex-col gap-8 py-4', isMobile ? 'px-4' : 'px-10')}>
                {memoizedPreviousThreadItems}
                {currentThreadItem && (
                    <div key={currentThreadItem.id} className="min-h-[calc(100dvh-16rem)]">
                        <ThreadItem
                            key={currentThreadItem.id}
                            threadItem={currentThreadItem}
                            isAnimated={true}
                            isLast={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
