'use client';
import { ChatModeOptions } from '@repo/common/components';
import { useAgentStream, useCopyText } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import { ChatMode, getChatModeName } from '@repo/shared/config';
import { ThreadItem } from '@repo/shared/types';
import { Button, DropdownMenu, DropdownMenuTrigger } from '@repo/ui';
import { IconCheck, IconCopy, IconMarkdown, IconRefresh, IconTrash } from '@tabler/icons-react';
import { forwardRef, useState } from 'react';
type MessageActionsProps = {
    threadItem: ThreadItem;
    isLast: boolean;
};

export const MessageActions = forwardRef<HTMLDivElement, MessageActionsProps>(
    ({ threadItem, isLast }, ref) => {
        const { handleSubmit } = useAgentStream();
        const removeThreadItem = useChatStore(state => state.deleteThreadItem);
        const getThreadItems = useChatStore(state => state.getThreadItems);
        const useWebSearch = useChatStore(state => state.useWebSearch);
        const [chatMode, setChatMode] = useState<ChatMode>(threadItem.mode);
        const { copyToClipboard, status, copyMarkdown, markdownCopyStatus } = useCopyText();
        return (
            <div className="flex flex-row items-center gap-1 py-2">
                {threadItem?.answer?.text && (
                    <Button
                        variant="secondary"
                        size="icon-sm"
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
                    </Button>
                )}

                {threadItem?.answer?.text && (
                    <Button
                        variant="secondary"
                        size="icon-sm"
                        rounded="full"
                        onClick={() => {
                            copyMarkdown(
                                `${threadItem?.answer?.text}\n\n## References\n${threadItem?.sources
                                    ?.map(source => `[${source.index}] ${source.link}`)
                                    .join('\n')}`
                            );
                        }}
                        tooltip="Copy Markdown"
                    >
                        {markdownCopyStatus === 'copied' ? (
                            <IconCheck size={16} strokeWidth={2} />
                        ) : (
                            <IconMarkdown size={16} strokeWidth={2} />
                        )}
                    </Button>
                )}
                {threadItem.status !== 'ERROR' && threadItem.answer?.status !== 'HUMAN_REVIEW' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon-sm"
                                rounded="full"
                                tooltip="Rewrite"
                            >
                                <IconRefresh size={16} strokeWidth={2} />
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
                )}

                {isLast && (
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
                )}
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
