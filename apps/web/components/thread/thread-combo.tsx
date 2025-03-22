import { useChatStore } from '@/lib/store/chat.store';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ThreadItem } from './thread-item';
export function Thread() {
  const { threadId } = useParams();
  const currentThreadId =  threadId?.toString() ?? "";
  const previousThreadItems = useChatStore(useShallow(state => state.getPreviousThreadItems(currentThreadId)));
  const currentThreadItem = useChatStore(useShallow(state => state.getCurrentThreadItem(currentThreadId)));

  const memoizedPreviousThreadItems = useMemo(() => {
    return previousThreadItems.map(threadItem => (
      <div key={threadItem.id}>
        <ThreadItem
          key={threadItem.id}
          threadItem={threadItem}
          isAnimated={false}
        />
      </div>
    ));
  }, [previousThreadItems?.length]);

  return (
    <div className="relative" id="thread-container">
      <div className="min-w-full h-full flex flex-col gap-8  py-4">
            {memoizedPreviousThreadItems}
            {currentThreadItem && (
              <div key={currentThreadItem.id}>
                <ThreadItem
                  key={currentThreadItem.id}
                  threadItem={currentThreadItem}
                  isAnimated={true}
                />
              </div>
            )}
      </div>
    </div>
  );
}
