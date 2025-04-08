import { useChatStore } from '@repo/common/store';
import { Thread } from '@repo/shared/types';
import {
    Button,
    cn,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Flex,
    Input,
} from '@repo/ui';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export const HistoryItem = ({
    thread,
    dismiss,
    isActive,
    isPinned,
    pinThread,
    unpinThread,
}: {
    thread: Thread;
    dismiss: () => void;
    isActive?: boolean;
    isPinned?: boolean;
    pinThread: (threadId: string) => void;
    unpinThread: (threadId: string) => void;
}) => {
    const { push } = useRouter();
    const { threadId: currentThreadId } = useParams();
    const updateThread = useChatStore(state => state.updateThread);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(thread.title);
    const deleteThread = useChatStore(state => state.deleteThread);
    const historyInputRef = useRef<HTMLInputElement>(null);
    const switchThread = useChatStore(state => state.switchThread);
    const [openOptions, setOpenOptions] = useState(false);

    useEffect(() => {
        if (isEditing) {
            historyInputRef.current?.focus();
        }
    }, [isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleInputBlur = () => {
        setIsEditing(false);
        updateThread({
            id: thread.id,
            title: title?.trim() || 'Untitled',
        });
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            updateThread({
                id: thread.id,
                title: title?.trim() || 'Untitled',
            });
        }
    };

    const containerClasses = cn(
        'gap-2 w-full group w-full relative flex flex-row items-center h-7 py-0.5 pl-2 pr-1 rounded-sm hover:bg-quaternary',
        isActive || isEditing ? 'bg-tertiary' : ''
    );

    const handleEditClick = () => {
        setIsEditing(true);
        setTimeout(() => {
            historyInputRef.current?.focus();
        }, 500);
    };

    const handleDeleteConfirm = () => {
        deleteThread(thread.id);
        if (currentThreadId === thread.id) {
            push('/chat');
        }
    };

    return (
        <div key={thread.id} className={containerClasses}>
            {isEditing ? (
                <Input
                    variant="ghost"
                    className="h-5 pl-0 text-xs"
                    ref={historyInputRef}
                    value={title || 'Untitled'}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    onBlur={handleInputBlur}
                />
            ) : (
                <Link
                    href={`/chat/${thread.id}`}
                    className="flex flex-1 items-center"
                    onClick={() => switchThread(thread.id)}
                >
                    <Flex
                        direction="col"
                        items="start"
                        className="flex-1 overflow-hidden"
                        gap="none"
                    >
                        <p className="hover:text-foreground line-clamp-1 w-full text-xs">
                            {thread.title}
                        </p>
                    </Flex>
                </Link>
            )}
            <DropdownMenu open={openOptions} onOpenChange={setOpenOptions}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        className="bg-quaternary invisible absolute right-1 shrink-0 group-hover:visible group-hover:w-6"
                        onClick={e => {
                            e.stopPropagation();
                            setOpenOptions(!openOptions);
                        }}
                    >
                        <MoreHorizontal
                            size={14}
                            strokeWidth="2"
                            className="text-muted-foreground/50"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right">
                    <DropdownMenuItem
                        onClick={e => {
                            e.stopPropagation();
                            handleEditClick();
                        }}
                    >
                        Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={e => {
                            e.stopPropagation();
                            handleDeleteConfirm();
                        }}
                    >
                        Delete Chat
                    </DropdownMenuItem>
                    {isPinned ? (
                        <DropdownMenuItem onClick={() => unpinThread(thread.id)}>
                            Unpin
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={() => pinThread(thread.id)}>
                            Pin
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
