import { ThreadItem } from '@repo/common/components';
import { useChatStore } from '@repo/common/store';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function Thread() {
    const { threadId } = useParams();
    const currentThreadId = threadId?.toString() ?? '';
    const previousThreadItems = useChatStore(
        useShallow(state => state.getPreviousThreadItems(currentThreadId))
    );
    const currentThreadItem = useChatStore(
        useShallow(state => state.getCurrentThreadItem(currentThreadId))
    );
    const isGenerating = useChatStore(useShallow(state => state.isGenerating));
    const memoizedPreviousThreadItems = useMemo(() => {
        return previousThreadItems.map(threadItem => (
            <div key={threadItem.id}>
                <ThreadItem
                    key={threadItem.id}
                    threadItem={threadItem}
                    isAnimated={false}
                    isGenerating={false}
                    isLast={false}
                />
            </div>
        ));
    }, [previousThreadItems]);

    return (
        <div className="relative" id="thread-container">
            <div className="flex min-w-full flex-col gap-8 px-2 py-4">
                {memoizedPreviousThreadItems}
                {currentThreadItem && (
                    <div key={currentThreadItem.id} className="min-h-[calc(100dvh-16rem)]">
                        <ThreadItem
                            key={currentThreadItem.id}
                            threadItem={currentThreadItem}
                            isAnimated={true}
                            isGenerating={isGenerating}
                            isLast={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
