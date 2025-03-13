import { useChatStore } from '@/lib/store/chat.store';
import { useShallow } from 'zustand/react/shallow';
import { ThreadItem } from './thread-item';
export function Thread() {
  const currentThreadId = useChatStore(state => state.currentThreadId);
  const threadItems = useChatStore(useShallow(state => state.getThreadItems(currentThreadId)));



  return (
    <div className="relative flex flex-col gap-2" id="thread-container">
      <div className="min-w-full h-full  py-4">
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
