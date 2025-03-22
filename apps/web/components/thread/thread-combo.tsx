import { useChatStore } from '@/lib/store/chat.store';
import { useParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { ThreadItem } from './thread-item';
export function Thread() {
  const { threadId } = useParams();
  const currentThreadId =  threadId?.toString() ?? "";
  const threadItems = useChatStore(useShallow(state => state.getThreadItems(currentThreadId)));

  return (
    <div className="relative" id="thread-container">
      <div className="min-w-full h-full flex flex-col gap-8  py-4">
        {threadItems.map(threadItem => (
          <div key={threadItem.id}>
                <ThreadItem
                  key={threadItem.id}
                  threadItem={threadItem}
                  isAnimated={false}
                />
            </div>
          
        ))}
      </div>
    </div>
  );
}
