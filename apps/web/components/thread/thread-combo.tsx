import { useChatStore } from '@/lib/store/chat.store';
import { Button } from '@repo/ui';
import { IconTrash } from '@tabler/icons-react';
import { ThreadItem } from './thread-item';

export function Thread() {
  const currentThreadId = useChatStore(state => state.currentThreadId);
  const messageGroups = useChatStore(state => state.getMessageGroups(currentThreadId));
  const deleteThreadItem = useChatStore(state => state.deleteThreadItem);
  const isGenerating = useChatStore(state => state.isGenerating);
  const threadItems = useChatStore(state => state.threadItems);

  const currentMessageGroups = messageGroups;

  return (
    <div className="relative flex flex-col gap-2" id="thread-container">
      <div className="min-w-ful h-full  py-4">
        {currentMessageGroups.map(messageGroup => (
          <div key={messageGroup.userMessage.id}>
            <div className="flex w-full flex-row justify-end">
              <ThreadItem
                key={messageGroup.userMessage.id}
                threadItem={messageGroup.userMessage}
                isAnimated={false}
              />
            </div>
            <div className="flex w-full flex-col">
              {messageGroup.assistantMessages.map(assistantMessage => (
                <ThreadItem
                  key={assistantMessage.id}
                  threadItem={assistantMessage}
                  isAnimated={false}
                />
              ))}
            </div>
            {messageGroup.assistantMessages.length > 0 && !isGenerating && (
              <div className="flex flex-row justify-start py-4">
                <Button
                  variant="secondary"
                  size="xs"
                  className="gap-2"
                  onClick={() => {
                    deleteThreadItem(messageGroup.userMessage.id);
                    messageGroup.assistantMessages.forEach(assistantMessage => {
                      deleteThreadItem(assistantMessage.id);
                    });
                  }}
                >
                  <IconTrash size={14} /> Remove
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
