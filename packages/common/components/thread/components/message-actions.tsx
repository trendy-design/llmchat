'use client';
import { ChatModeOptions } from '@repo/common/components';
import { useAgentStream, useCopyText } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import { ChatMode, getChatModeName } from '@repo/shared/config';
import { ThreadItem } from '@repo/shared/types';
import { Button, DropdownMenu, DropdownMenuTrigger } from '@repo/ui';
import { IconCheck } from '@tabler/icons-react';
import { CheckIcon, Copy, RefreshCcw, TrashIcon } from 'lucide-react';
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
                {threadItem?.breakpoint && (
                    <Button
                        variant="secondary"
                        size="icon-sm"
                        rounded="full"
                        tooltip="Approve"
                        onClick={async () => {
                            const formData = new FormData();
                            formData.append('query', threadItem.query || '');
                            const threadItems = await getThreadItems(threadItem.threadId);
                            handleSubmit({
                                formData,
                                existingThreadItemId: threadItem.id,
                                newChatMode: threadItem.mode as any,
                                messages: threadItems,
                                useWebSearch: useWebSearch,
                                breakpointId: threadItem.breakpoint?.id,
                                breakpointData: threadItem.breakpoint?.data,
                            });
                        }}
                    >
                        <IconCheck size={16} strokeWidth={2} />
                    </Button>
                )}
                {(threadItem?.answer?.text || threadItem?.answer?.messages?.length) && (
                    <Button
                        variant="ghost-bordered"
                        size="icon-sm"
                        onClick={() => {
                            if (ref && 'current' in ref && ref.current) {
                                copyToClipboard(ref.current || '');
                            }
                        }}
                        tooltip="Copy"
                    >
                        {status === 'copied' ? (
                            <CheckIcon size={16} strokeWidth={2} />
                        ) : (
                            <Copy size={16} strokeWidth={2} />
                        )}
                    </Button>
                )}

                {/* {threadItem?.answer?.text && (
                    <Button
                        variant="ghost-bordered"
                        size="icon-sm"
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
                            <CheckIcon size={16} strokeWidth={2} />
                        ) : (
                            <Mark size={16} strokeWidth={2} />
                        )}
                    </Button>
                )} */}
                {threadItem.status !== 'ERROR' && threadItem.answer?.status !== 'HUMAN_REVIEW' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost-bordered" size="icon-sm" tooltip="Rewrite">
                                <RefreshCcw size={16} strokeWidth={2} />
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
                        variant="ghost-bordered"
                        size="icon-sm"
                        onClick={() => {
                            removeThreadItem(threadItem.id);
                        }}
                        tooltip="Remove"
                    >
                        <TrashIcon size={16} strokeWidth={2} />
                    </Button>
                )}
                {threadItem.mode && (
                    <p className="text-muted-foreground/50 px-2 text-xs">
                        Generated with {getChatModeName(threadItem.mode)}
                    </p>
                )}
            </div>
        );
    }
);

MessageActions.displayName = 'MessageActions';
