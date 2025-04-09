'use client';
import { useClerk, useUser } from '@clerk/nextjs';
import { FullPageLoader, HistoryItem, Logo } from '@repo/common/components';
import { useRootContext } from '@repo/common/context';
import { useAppStore, useChatStore } from '@repo/common/store';
import { Thread } from '@repo/shared/types';
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
    IconChevronRight,
    IconHistory,
    IconLogout,
    IconPinned,
    IconPlus,
    IconSearch,
    IconSelector,
    IconSettings,
    IconSettings2,
    IconUser,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';

export const Sidebar = () => {
    const { threadId: currentThreadId } = useParams();
    const pathname = usePathname();
    const { setIsCommandSearchOpen } = useRootContext();
    const isChatPage = pathname === '/chat';
    const threads = useChatStore(state => state.threads);
    const pinThread = useChatStore(state => state.pinThread);
    const unpinThread = useChatStore(state => state.unpinThread);
    const sortThreads = (threads: Thread[], sortBy: 'createdAt') => {
        return [...threads].sort((a, b) => moment(b[sortBy]).diff(moment(a[sortBy])));
    };

    const { isSignedIn, user } = useUser();
    const { openUserProfile, signOut, redirectToSignIn } = useClerk();
    const clearAllThreads = useChatStore(state => state.clearAllThreads);
    const setIsSidebarOpen = useAppStore(state => state.setIsSidebarOpen);
    const isSidebarOpen = useAppStore(state => state.isSidebarOpen);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const { push } = useRouter();
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

        //TODO: Paginate these threads
    });

    const renderGroup = ({
        title,
        threads,

        groupIcon,
        renderEmptyState,
    }: {
        title: string;
        threads: Thread[];
        groupIcon?: React.ReactNode;
        renderEmptyState?: () => React.ReactNode;
    }) => {
        if (threads.length === 0 && !renderEmptyState) return null;
        return (
            <Flex direction="col" items="start" className="w-full gap-0.5">
                <div className="text-muted-foreground/70 flex flex-row items-center gap-1 px-2 py-1 text-xs font-medium opacity-70">
                    {groupIcon}
                    {title}
                </div>
                {threads.length === 0 && renderEmptyState ? (
                    renderEmptyState()
                ) : (
                    <Flex className="border-border/50 w-full gap-0.5" gap="none" direction="col">
                        {threads.map(thread => (
                            <HistoryItem
                                thread={thread}
                                pinThread={() => pinThread(thread.id)}
                                unpinThread={() => unpinThread(thread.id)}
                                isPinned={thread.pinned}
                                key={thread.id}
                                dismiss={() => {
                                    setIsSidebarOpen(prev => false);
                                }}
                                isActive={thread.id === currentThreadId}
                            />
                        ))}
                    </Flex>
                )}
            </Flex>
        );
    };

    return (
        <div
            className={cn(
                'relative bottom-0 left-0 top-0 z-[50] flex h-[100dvh] flex-shrink-0 flex-col  py-2 transition-all duration-200',
                isSidebarOpen ? 'top-0 h-full w-[230px]' : 'w-[50px]'
            )}
        >
            <Flex direction="col" className="w-full flex-1 items-start overflow-hidden">
                <div className="mb-3 flex w-full flex-row items-center justify-between">
                    <Link href="/chat" className="w-full">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className={cn(
                                'flex h-8 w-full cursor-pointer items-center justify-start gap-1.5 px-4',
                                !isSidebarOpen && 'justify-center px-0'
                            )}
                        >
                            <Logo className="size-5 text-emerald-900" />
                            {isSidebarOpen && (
                                <p className="font-clash text-lg font-bold tracking-wide text-emerald-900">
                                    llmchat.co
                                </p>
                            )}
                        </motion.div>
                    </Link>
                    {isSidebarOpen && (
                        <Button
                            variant="ghost"
                            tooltip="Close Sidebar"
                            tooltipSide="right"
                            size="icon-sm"
                            onClick={() => setIsSidebarOpen(prev => !prev)}
                            className={cn(!isSidebarOpen && 'mx-auto', 'mr-2')}
                        >
                            <IconArrowBarLeft size={16} strokeWidth={2} />
                        </Button>
                    )}
                </div>
                <Flex
                    direction="col"
                    className={cn(
                        'w-full items-end px-3 ',
                        !isSidebarOpen && 'items-center justify-center px-0'
                    )}
                    gap="sm"
                >
                    {!isChatPage ? (
                        <Link href="/chat" className={isSidebarOpen ? 'w-full' : ''}>
                            <Button
                                size={isSidebarOpen ? 'xs' : 'icon-sm'}
                                variant="secondary"
                                rounded="lg"
                                tooltip={isSidebarOpen ? undefined : 'New Thread'}
                                tooltipSide="right"
                                className={cn(isSidebarOpen && 'relative w-full', 'justify-center')}
                            >
                                <IconPlus
                                    size={16}
                                    strokeWidth={2}
                                    className={cn(isSidebarOpen && 'absolute left-2')}
                                />
                                {isSidebarOpen && 'New'}
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            size={isSidebarOpen ? 'xs' : 'icon-sm'}
                            variant="secondary"
                            rounded="lg"
                            tooltip={isSidebarOpen ? undefined : 'New Thread'}
                            tooltipSide="right"
                            className={cn(isSidebarOpen && 'relative w-full', 'justify-center')}
                        >
                            <IconPlus
                                size={16}
                                strokeWidth={2}
                                className={cn(isSidebarOpen && 'absolute left-2')}
                            />
                            {isSidebarOpen && 'New Thread'}
                        </Button>
                    )}
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
                <Flex
                    direction="col"
                    gap="xs"
                    className={cn(
                        'border-hard mt-3 w-full  justify-center border-t border-dashed px-3 py-2',
                        !isSidebarOpen && 'items-center justify-center px-0'
                    )}
                >
                    <Link href="/recent" className={isSidebarOpen ? 'w-full' : ''}>
                        <Button
                            size={isSidebarOpen ? 'xs' : 'icon-sm'}
                            variant="secondary"
                            rounded="lg"
                            tooltip={isSidebarOpen ? undefined : 'Recent'}
                            tooltipSide="right"
                            className={cn(
                                'text-muted-foreground w-full justify-start',
                                !isSidebarOpen && 'w-auto justify-center'
                            )}
                        >
                            <IconHistory size={14} strokeWidth={2} />
                            {isSidebarOpen && 'Recent'}
                            {isSidebarOpen && <span className="inline-flex flex-1" />}
                            {isSidebarOpen && <IconChevronRight size={14} strokeWidth={2} />}
                        </Button>
                    </Link>
                </Flex>

                {false ? (
                    <FullPageLoader />
                ) : (
                    <Flex
                        direction="col"
                        gap="md"
                        className={cn(
                            'no-scrollbar w-full flex-1 overflow-y-auto px-3 pb-[100px]',
                            isSidebarOpen ? 'flex' : 'hidden'
                        )}
                    >
                        {renderGroup({
                            title: 'Pinned',
                            threads: threads
                                .filter(thread => thread.pinned)
                                .sort((a, b) => b.pinnedAt.getTime() - a.pinnedAt.getTime()),
                            groupIcon: <IconPinned size={14} strokeWidth={2} />,
                            renderEmptyState: () => (
                                <div className="border-hard flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-2">
                                    <p className="text-muted-foreground text-xs opacity-50">
                                        No pinned threads
                                    </p>
                                </div>
                            ),
                        })}
                        {renderGroup({ title: 'Today', threads: groupedThreads.today })}
                        {renderGroup({ title: 'Yesterday', threads: groupedThreads.yesterday })}
                        {renderGroup({ title: 'Last 7 Days', threads: groupedThreads.last7Days })}
                        {renderGroup({ title: 'Last 30 Days', threads: groupedThreads.last30Days })}
                        {renderGroup({
                            title: 'Previous Months',
                            threads: groupedThreads.previousMonths,
                        })}
                    </Flex>
                )}

                <Flex
                    className={cn(
                        'from-tertiary via-tertiary/95 absolute bottom-0 mt-auto w-full items-center bg-gradient-to-t via-60% to-transparent p-2 pt-12',
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
                    {isSignedIn && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div
                                    className={cn(
                                        'hover:bg-quaternary flex w-full cursor-pointer flex-row items-center gap-3 rounded-lg p-2 px-2',
                                        !isSidebarOpen && 'px-1.5'
                                    )}
                                >
                                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-800">
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
                                {/* {!isSignedIn && (
                                <DropdownMenuItem onClick={() => push('/sign-in')}>
                                    <IconUser size={16} strokeWidth={2} />
                                    Log in
                                </DropdownMenuItem>
                            )} */}
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
                    )}
                    {isSidebarOpen && !isSignedIn && (
                        <div className="flex w-full flex-col gap-1.5 p-1">
                            <Button
                                variant="secondary"
                                size="sm"
                                rounded="lg"
                                onClick={() => {
                                    setIsSettingsOpen(true);
                                }}
                            >
                                <IconSettings2 size={14} strokeWidth={2} />
                                Settings
                            </Button>
                            <Button
                                variant="brand"
                                size="sm"
                                rounded="lg"
                                onClick={() => push('/sign-in')}
                            >
                                Log in / Sign up
                            </Button>
                        </div>
                    )}
                </Flex>
            </Flex>
        </div>
    );
};
