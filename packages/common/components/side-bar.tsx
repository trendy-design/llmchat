'use client';
import { useClerk, useUser } from '@clerk/nextjs';
import { FullPageLoader, HistoryItem } from '@repo/common/components';
import { useRootContext } from '@repo/common/context';
import { Thread, useAppStore, useChatStore } from '@repo/common/store';
import {
    Button,
    cn,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Flex,
} from '@repo/ui';
import {
    IconArrowBarLeft,
    IconArrowBarRight,
    IconLogout,
    IconPlus,
    IconSearch,
    IconSelector,
    IconSettings,
    IconSettings2,
    IconUser,
} from '@tabler/icons-react';
import moment from 'moment';
import Image from 'next/image';
import { useParams, usePathname, useRouter } from 'next/navigation';

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

    const { isSignedIn, user } = useUser();
    const { openUserProfile, signOut, openSignIn } = useClerk();
    const clearAllThreads = useChatStore(state => state.clearAllThreads);
    const setIsSidebarOpen = useAppStore(state => state.setIsSidebarOpen);
    const isSidebarOpen = useAppStore(state => state.isSidebarOpen);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);

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
                <p className="text-muted-foreground px-2 py-1 text-xs font-medium">{title}</p>
                <Flex className="border-border/50 w-full" gap="none" direction="col">
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
            className={cn(
                'bottom-0 left-0 top-0 z-[50] flex h-[100dvh] flex-shrink-0 flex-col  py-2 transition-all duration-200',
                isSidebarOpen ? 'top-0 h-full w-[220px]' : 'w-[60px]'
            )}
        >
            <Flex direction="col" className="w-full flex-1 overflow-hidden">
                <Flex direction="col" className="w-full items-end px-4" gap="sm">
                    {isSidebarOpen && (
                        <Button
                            variant="ghost"
                            size={isSidebarOpen ? 'sm' : 'icon'}
                            onClick={() => setIsSidebarOpen(prev => !prev)}
                            className={cn(
                                'w-full justify-start',
                                !isSidebarOpen && 'mx-auto justify-center'
                            )}
                            tooltip="Close Sidebar"
                            tooltipSide="right"
                        >
                            <IconArrowBarLeft size={16} strokeWidth={2} /> Close
                        </Button>
                    )}
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
                    <Button
                        size={isSidebarOpen ? 'sm' : 'icon-sm'}
                        variant="default"
                        rounded="lg"
                        tooltip={isSidebarOpen ? undefined : 'New Thread'}
                        tooltipSide="right"
                        className={cn(
                            isSidebarOpen && 'relative w-full',
                            'justify-center',
                            'text-background border border-teal-800 bg-teal-700'
                        )}
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
                        size={isSidebarOpen ? 'sm' : 'icon-sm'}
                        variant="bordered"
                        rounded="lg"
                        tooltip={isSidebarOpen ? undefined : 'Search'}
                        tooltipSide="right"
                        className={cn(isSidebarOpen && 'relative w-full', 'justify-center')}
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
                            'border-border/70 no-scrollbar mt-3 w-full flex-1 overflow-y-auto border-t border-dashed p-3',
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
                    {isSignedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="hover:bg-quaternary flex w-full cursor-pointer flex-row items-center gap-3 rounded-lg p-2 px-3">
                                    <div className="flex size-5 items-center justify-center rounded-full bg-teal-800">
                                        <Image
                                            src={user?.imageUrl ?? ''}
                                            width={0}
                                            height={0}
                                            sizes="100vw"
                                            className="size-full rounded-full"
                                            alt={user?.fullName ?? ''}
                                        />
                                    </div>
                                    {isSidebarOpen && (
                                        <p className="flex-1 text-sm font-medium">
                                            {user?.fullName}
                                        </p>
                                    )}
                                    {isSidebarOpen && (
                                        <IconSelector
                                            size={14}
                                            strokeWidth={2}
                                            className="text-muted-foreground"
                                        />
                                    )}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                                    <IconSettings size={16} strokeWidth={2} />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openUserProfile()}>
                                    <IconUser size={16} strokeWidth={2} />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => signOut()}>
                                    <IconLogout size={16} strokeWidth={2} />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Flex direction={isSidebarOpen ? 'col' : 'col'} gap="xs" className="w-full">
                            <Button
                                variant="ghost"
                                size={isSidebarOpen ? 'sm' : 'icon-sm'}
                                className={cn(
                                    'hover:bg-quaternary w-full justify-start',
                                    !isSidebarOpen && 'mx-auto'
                                )}
                                onClick={() => setIsSettingsOpen(true)}
                                tooltip={isSidebarOpen ? undefined : 'Settings'}
                                tooltipSide="right"
                            >
                                <IconSettings2 size={16} strokeWidth={2} />
                                {isSidebarOpen && 'Settings'}
                            </Button>
                            <Button
                                variant="ghost"
                                size={isSidebarOpen ? 'sm' : 'icon-sm'}
                                className={cn(
                                    'hover:bg-quaternary w-full justify-start',
                                    !isSidebarOpen && 'mx-auto'
                                )}
                                onClick={() => openSignIn()}
                                tooltip={isSidebarOpen ? undefined : 'Sign In'}
                                tooltipSide="right"
                            >
                                <div
                                    className={cn(
                                        'flex items-center gap-2',
                                        !isSidebarOpen && 'justify-center'
                                    )}
                                >
                                    <div className="flex size-5 items-center justify-center rounded-full bg-teal-800">
                                        <IconUser
                                            size={14}
                                            strokeWidth={2}
                                            className="text-white"
                                        />
                                    </div>
                                    {isSidebarOpen && 'Sign In'}
                                </div>
                            </Button>
                        </Flex>
                    )}
                </Flex>
            </Flex>
        </div>
    );
};
