'use client';
import { useRootContext } from '@repo/common/context';
import { useAppStore, useChatStore } from '@repo/common/store';
import {
    cn,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    Kbd,
} from '@repo/ui';
import {
    IconCommand,
    IconKey,
    IconMessageCircleFilled,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';
import moment from 'moment';
import { useTheme } from 'next-themes';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const CommandSearch = () => {
    const { threadId: currentThreadId } = useParams();
    const { isCommandSearchOpen, setIsCommandSearchOpen } = useRootContext();
    const threads = useChatStore(state => state.threads);
    const getThread = useChatStore(state => state.getThread);
    const removeThread = useChatStore(state => state.deleteThread);
    const switchThread = useChatStore(state => state.switchThread);
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const clearThreads = useChatStore(state => state.clearAllThreads);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const setSettingTab = useAppStore(state => state.setSettingTab);
    const groupedThreads: Record<string, typeof threads> = {
        today: [],
        yesterday: [],
        last7Days: [],
        last30Days: [],
        previousMonths: [],
    };

    const groupsNames = {
        today: 'Today',
        yesterday: 'Yesterday',
        last7Days: 'Last 7 Days',
        last30Days: 'Last 30 Days',
        previousMonths: 'Previous Months',
    };

    threads.forEach(thread => {
        const createdAt = moment(thread.createdAt);
        const now = moment();
        if (createdAt.isSame(now, 'day')) {
            groupedThreads.today.push(thread);
        } else if (createdAt.isSame(now.clone().subtract(1, 'day'), 'day')) {
            groupedThreads.yesterday.push(thread);
        } else if (createdAt.isAfter(now.clone().subtract(7, 'days'))) {
            groupedThreads.last7Days.push(thread);
        } else if (createdAt.isAfter(now.clone().subtract(30, 'days'))) {
            groupedThreads.last30Days.push(thread);
        } else {
            groupedThreads.previousMonths.push(thread);
        }
    });

    useEffect(() => {
        router.prefetch('/chat');
    }, [isCommandSearchOpen, threads, router]);

    useEffect(() => {
        if (isCommandSearchOpen) {
        }
    }, [isCommandSearchOpen]);

    const onClose = () => setIsCommandSearchOpen(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandSearchOpen(true);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const actions = [
        {
            name: 'New Thread',
            icon: IconPlus,
            action: () => {
                router.push('/chat');
                onClose();
            },
        },
        {
            name: 'Delete Thread',
            icon: IconTrash,
            action: async () => {
                const thread = await getThread(currentThreadId as string);
                if (thread) {
                    removeThread(thread.id);
                    router.push('/chat');
                    onClose();
                }
            },
        },
        {
            name: 'Use your own API key',
            icon: IconKey,
            action: () => {
                setIsSettingsOpen(true);
                setSettingTab('api-keys');
                onClose();
            },
        },
        {
            name: 'Remove All Threads',
            icon: IconTrash,
            action: () => {
                clearThreads();
                router.push('/chat');
                onClose();
            },
        },
    ];

    return (
        <CommandDialog open={isCommandSearchOpen} onOpenChange={setIsCommandSearchOpen}>
            <div className="flex w-full flex-row items-center gap-2 p-0.5">
                <CommandInput placeholder="Search..." className="w-full" />
                <div className="flex shrink-0 items-center gap-1 px-2">
                    <Kbd className="h-5 w-5">
                        <IconCommand size={12} strokeWidth={2} className="shrink-0" />
                    </Kbd>
                    <Kbd className="h-5 w-5">K</Kbd>
                </div>
            </div>
            <div className="w-full">
                <div className="border-border h-[1px] w-full border-b" />
            </div>
            <CommandList className="max-h-[420px] overflow-y-auto p-0.5 pt-1.5">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                    {actions.map(action => (
                        <CommandItem
                            key={action.name}
                            className="gap-"
                            value={action.name}
                            onSelect={action.action}
                        >
                            <action.icon
                                size={14}
                                strokeWidth="2"
                                className="text-muted-foreground flex-shrink-0"
                            />
                            {action.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
                {Object.entries(groupedThreads).map(
                    ([key, threads]) =>
                        threads.length > 0 && (
                            <CommandGroup
                                key={key}
                                heading={groupsNames[key as keyof typeof groupsNames]}
                            >
                                {threads.map(thread => (
                                    <CommandItem
                                        key={thread.id}
                                        value={`${thread.id}/${thread.title}`}
                                        className={cn('w-full gap-3')}
                                        onSelect={() => {
                                            switchThread(thread.id);
                                            router.push(`/c/${thread.id}`);
                                            onClose();
                                        }}
                                    >
                                        <IconMessageCircleFilled
                                            size={16}
                                            strokeWidth={2}
                                            className="text-muted-foreground/50"
                                        />
                                        <span className="w-full truncate font-normal">
                                            {thread.title}
                                        </span>
                                        {/* <span className="text-muted-foreground flex-shrink-0 pl-4 text-xs !font-normal">
                                            {moment(thread.createdAt).fromNow(true)}
                                        </span> */}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )
                )}
            </CommandList>
        </CommandDialog>
    );
};
