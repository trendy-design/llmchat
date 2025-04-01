'use client';
import { useClerk, useUser } from '@clerk/nextjs';
import { FullPageLoader, HistoryItem, Logo } from '@repo/common/components';
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
    IconUser,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import moment from 'moment';
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
                isSidebarOpen ? 'top-0 h-full w-[220px]' : 'w-[50px]'
            )}
        >
            <Flex direction="col" className="w-full flex-1 items-center overflow-hidden">
                <div className="mb-4 flex w-full flex-row items-center justify-between ">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className={cn(
                            'flex h-8  w-full items-center justify-start gap-1.5 px-4',
                            !isSidebarOpen && 'justify-center px-0'
                        )}
                    >
                        <Logo className="size-4 text-cyan-900" />
                        {isSidebarOpen && (
                            <p className="font-clash text-lg font-bold tracking-wide text-cyan-900">
                                deep.new
                            </p>
                        )}
                    </motion.div>
                    {isSidebarOpen && (
                        <Button
                            variant="ghost"
                            tooltip="Close Sidebar"
                            tooltipSide="right"
                            size="icon"
                            onClick={() => setIsSidebarOpen(prev => !prev)}
                            className={cn(!isSidebarOpen && 'mx-auto')}
                        >
                            <IconArrowBarLeft size={16} strokeWidth={2} />
                        </Button>
                    )}
                </div>
                <Flex
                    direction="col"
                    className={cn(
                        'w-full items-end px-4',
                        !isSidebarOpen && 'items-center justify-center px-0'
                    )}
                    gap="sm"
                >
                    <Button
                        size={isSidebarOpen ? 'xs' : 'icon-sm'}
                        variant="secondary"
                        rounded="lg"
                        tooltip={isSidebarOpen ? undefined : 'New Thread'}
                        tooltipSide="right"
                        className={cn(
                            isSidebarOpen && 'relative w-full',
                            'justify-center'
                            // 'text-background border border-cyan-800 bg-cyan-700'
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
                        size={isSidebarOpen ? 'xs' : 'icon-sm'}
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
                    className={cn(
                        'mt-auto w-full items-center p-2',
                        isSidebarOpen && 'items-start justify-between'
                    )}
                    gap="xs"
                    direction={'col'}
                >
                    {!isSidebarOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            tooltip="Open Sidebar"
                            tooltipSide="right"
                            onClick={() => setIsSidebarOpen(prev => !prev)}
                            className={cn(!isSidebarOpen && 'mx-auto')}
                        >
                            <IconArrowBarRight size={16} strokeWidth={2} />
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div
                                className={cn(
                                    'hover:bg-quaternary flex w-full cursor-pointer flex-row items-center gap-3 rounded-lg p-2 px-2',
                                    !isSidebarOpen && 'px-1.5'
                                )}
                            >
                                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-cyan-800">
                                    {user && user.hasImage ? (
                                        <img
                                            src={user?.imageUrl ?? ''}
                                            width={0}
                                            height={0}
                                            className="size-full shrink-0 rounded-full"
                                            alt={user?.fullName ?? ''}
                                        />
                                    ) : (
                                        <IconUser
                                            size={14}
                                            strokeWidth={2}
                                            className="text-background"
                                        />
                                    )}
                                </div>
                                {!isSignedIn && (
                                    <p className="line-clamp-1 flex-1 !text-sm font-medium">
                                        Sign in to continue
                                    </p>
                                )}
                                {isSidebarOpen && (
                                    <p className="line-clamp-1 flex-1 !text-sm font-medium">
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
                            {!isSignedIn && (
                                <DropdownMenuItem onClick={() => openSignIn()}>
                                    <IconUser size={16} strokeWidth={2} />
                                    Log in
                                </DropdownMenuItem>
                            )}
                            {isSignedIn && (
                                <DropdownMenuItem onClick={() => openUserProfile()}>
                                    <IconUser size={16} strokeWidth={2} />
                                    Profile
                                </DropdownMenuItem>
                            )}
                            {isSignedIn && (
                                <DropdownMenuItem onClick={() => signOut()}>
                                    <IconLogout size={16} strokeWidth={2} />
                                    Logout
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Flex>
            </Flex>
        </div>
    );
};
