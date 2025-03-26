import { ChatModeOptions } from '@/components/chat-input/chat-actions';
import { useAgentStream } from '@/hooks/agent-provider';
import { useCopyText } from '@/hooks/use-copy-text';
import { ThreadItem, useChatStore } from '@/libs/store/chat.store';
import { ChatMode, getChatModeName } from '@repo/shared/config';
import { Button, DropdownMenu, DropdownMenuTrigger } from '@repo/ui';
import { IconCheck, IconCopy, IconRefresh, IconTrash } from '@tabler/icons-react';
import { forwardRef, useState } from 'react';

type MessageActionsProps = {
    threadItem: ThreadItem;
};

export const MessageActions = forwardRef<HTMLDivElement, MessageActionsProps>(
    ({ threadItem }, ref) => {
        const { handleSubmit } = useAgentStream();
        const removeThreadItem = useChatStore(state => state.deleteThreadItem);
        const getThreadItems = useChatStore(state => state.getThreadItems);
        const useWebSearch = useChatStore(state => state.useWebSearch);
        const [chatMode, setChatMode] = useState<ChatMode>(threadItem.mode);
        const { copyToClipboard, status } = useCopyText();
        return (
            <div className="flex flex-row items-center gap-1 py-2">
                <Button
                    variant="secondary"
                    size="xs"
                    rounded="full"
                    onClick={() => {
                        if (ref && 'current' in ref && ref.current) {
                            copyToClipboard(ref.current || '');
                        }
                    }}
                    tooltip="Copy"
                >
                    {status === 'copied' ? (
                        <IconCheck size={16} strokeWidth={2} />
                    ) : (
                        <IconCopy size={16} strokeWidth={2} />
                    )}
                    {status === 'copied' ? 'Copied' : 'Copy'}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="xs" rounded="full" tooltip="Rewrite">
                            <IconRefresh size={16} strokeWidth={2} />
                            Rewrite
                        </Button>
                    </DropdownMenuTrigger>
                    <ChatModeOptions
                        chatMode={chatMode}
                        setChatMode={async mode => {
                            setChatMode(mode);
                            const formData = new FormData();
                            formData.append('query', threadItem.query || '');
                            const threadItems = await getThreadItems(threadItem.threadId);
                            handleSubmit({
                                formData,
                                existingThreadItemId: threadItem.id,
                                newChatMode: mode as any,
                                messages: threadItems,
                                useWebSearch: useWebSearch,
                            });
                        }}
                    />
                </DropdownMenu>
                <Button
                    variant="secondary"
                    size="icon-sm"
                    rounded="full"
                    onClick={() => {
                        removeThreadItem(threadItem.id);
                    }}
                    tooltip="Remove"
                >
                    <IconTrash size={16} strokeWidth={2} />
                </Button>
                {threadItem.mode && (
                    <p className="text-muted-foreground px-2 text-xs">
                        Generated with {getChatModeName(threadItem.mode)}
                    </p>
                )}
            </div>
        );
    }
);

MessageActions.displayName = 'MessageActions';
