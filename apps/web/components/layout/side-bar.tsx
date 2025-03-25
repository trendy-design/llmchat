import { useRootContext } from '@/libs/context/root';
import { useAppStore } from '@/libs/store/app.store';
import { Thread, useChatStore } from '@/libs/store/chat.store';
import { Button, cn, Flex } from '@repo/ui';
import { IconArrowBarLeft, IconArrowBarRight, IconPlus, IconSearch } from '@tabler/icons-react';
import moment from 'moment';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { FullPageLoader } from '../full-page-loader';
import { HistoryItem } from '../history/history-item';

export const Sidebar = () => {
    const { threadId: currentThreadId } = useParams();
    const pathname = usePathname();
    const { setIsCommandSearchOpen } = useRootContext();
    const { push } = useRouter();
    const isChatPage = pathname.startsWith('/chat');
    const threads = useChatStore(state => state.threads);
    const sortThreads = (threads: Thread[], sortBy: 'createdAt') => {
        return [...threads].sort((a, b) => moment(b[sortBy]).diff(moment(a[sortBy])));
    };
    const clearAllThreads = useChatStore(state => state.clearAllThreads);
    const setIsSidebarOpen = useAppStore(state => state.setIsSidebarOpen);
    const isSidebarOpen = useAppStore(state => state.isSidebarOpen);

    const groupedThreads: Record<string, Thread[]> = {
        today: [],
        yesterday: [],
        last7Days: [],
        last30Days: [],
        previousMonths: [],
    };

    sortThreads(threads, 'createdAt')?.forEach(thread => {
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

    const renderGroup = (title: string, threads: Thread[]) => {
        if (threads.length === 0) return null;
        return (
            <Flex gap="xs" direction="col" items="start" className="w-full">
                <p className="text-muted-foreground py-1 text-xs">{title}</p>
                <Flex
                    className="border-border/50 w-full gap-0.5 border-l pl-2"
                    gap="none"
                    direction="col"
                >
                    {threads.map(thread => (
                        <HistoryItem
                            thread={thread}
                            key={thread.id}
                            dismiss={() => {
                                setIsSidebarOpen(prev => false);
                            }}
                            isActive={thread.id === currentThreadId}
                        />
                    ))}
                </Flex>
            </Flex>
        );
    };

    return (
        <div
            // onMouseLeave={() => {
            //   if (isSidebarOpen) {
            //     setIsSidebarOpen(prev => !prev);
            //   }
            // }}
            className={cn(
                'border-border/0 fixed bottom-0 left-0 top-0 z-[40] flex h-[100dvh] flex-shrink-0 flex-col border-r border-dashed transition-all duration-200',
                isSidebarOpen
                    ? 'bg-background border-border/70 top-0 h-full w-[240px] border-r'
                    : 'w-[50px]'
            )}
        >
            <Flex className="w-full items-center justify-between px-2 py-2">
                {isSidebarOpen && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(prev => !prev)}
                        className={cn(!isSidebarOpen && 'mx-auto')}
                        tooltip="Close Sidebar"
                    >
                        <IconArrowBarLeft size={16} strokeWidth={2} />
                    </Button>
                )}
            </Flex>

            <Flex direction="col" className="w-full flex-1 overflow-hidden">
                <Flex direction="col" className="w-full px-2" gap="sm">
                    <Button
                        size={isSidebarOpen ? 'sm' : 'icon'}
                        variant="bordered"
                        rounded="full"
                        tooltip={isSidebarOpen ? undefined : 'New Thread'}
                        tooltipSide="right"
                        className={cn('relative w-full shadow-sm', 'justify-center')}
                        onClick={() => !isChatPage && push('/chat')}
                    >
                        <IconPlus
                            size={16}
                            strokeWidth={2}
                            className={cn(isSidebarOpen && 'absolute left-2')}
                        />
                        {isSidebarOpen && 'New'}
                    </Button>
                    <Button
                        size={isSidebarOpen ? 'sm' : 'icon'}
                        variant="secondary"
                        rounded="full"
                        tooltip={isSidebarOpen ? undefined : 'Search'}
                        tooltipSide="right"
                        className={cn('relative w-full', 'justify-center')}
                        onClick={() => setIsCommandSearchOpen(true)}
                    >
                        <IconSearch
                            size={16}
                            strokeWidth={2}
                            className={cn(isSidebarOpen && 'absolute left-2')}
                        />
                        {isSidebarOpen && 'Search'}
                    </Button>
                </Flex>

                {false ? (
                    <FullPageLoader />
                ) : (
                    <Flex
                        direction="col"
                        gap="md"
                        className={cn(
                            'border-border/70 mt-3 w-full flex-1 overflow-y-auto border-t border-dashed p-3',
                            isSidebarOpen ? 'flex' : 'hidden'
                        )}
                    >
                        {renderGroup('Today', groupedThreads.today)}
                        {renderGroup('Yesterday', groupedThreads.yesterday)}
                        {renderGroup('Last 7 Days', groupedThreads.last7Days)}
                        {renderGroup('Last 30 Days', groupedThreads.last30Days)}
                        {renderGroup('Previous Months', groupedThreads.previousMonths)}
                    </Flex>
                )}

                <Flex
                    className="mt-auto w-full p-2"
                    gap="xs"
                    direction={'col'}
                    justify={isSidebarOpen ? 'between' : 'center'}
                >
                    {!isSidebarOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(prev => !prev)}
                            className={cn(!isSidebarOpen && 'mx-auto')}
                        >
                            <IconArrowBarRight size={16} strokeWidth={2} />
                        </Button>
                    )}

                    {isSidebarOpen && (
                        <Button size="sm" className="w-full" variant="brand" rounded="full">
                            <span className="text-sm">Log in</span>
                        </Button>
                    )}
                </Flex>
            </Flex>
        </div>
    );
};
