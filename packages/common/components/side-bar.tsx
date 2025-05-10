'use client';
import { useClerk, useUser } from '@clerk/nextjs';
import { HistoryItem, Logo } from '@repo/common/components';
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
    Popover,
    PopoverContent,
    PopoverTrigger,
    Tooltip,
} from '@repo/ui';

import {
    ArrowRight,
    BoltIcon,
    ChevronDownIcon,
    CircleHelp,
    Command,
    HelpCircle,
    HistoryIcon,
    HouseIcon,
    InfoIcon,
    LogOutIcon,
    Logs,
    Mail,
    PanelLeft,
    PinIcon,
    SettingsIcon,
    ThumbsUp,
    UserIcon,
    ZapIcon,
} from 'lucide-react';
import moment from 'moment';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FeedbackWidget } from './feedback-widget';
import { FaqDialog } from './information/faq';

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

    const { isSignedIn, user, isLoaded } = useUser();
    const { openUserProfile, signOut, redirectToSignIn, addListener } = useClerk();
    const clearAllThreads = useChatStore(state => state.clearAllThreads);
    const setIsSidebarOpen = useAppStore(state => state.setIsSidebarOpen);
    const isSidebarOpen = useAppStore(state => state.isSidebarOpen);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const setIsFaqOpen = useAppStore(state => state.setIsFaqOpen);
    const { push } = useRouter();
    const groupedThreads: Record<string, Thread[]> = {
        today: [],
        yesterday: [],
        last7Days: [],
        last30Days: [],
        previousMonths: [],
    };

    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    addListener(async event => {
        console.log({
            event,
        });
    });

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

    console.log({
        groupedThreads,
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
            <Flex direction="col" items="start" className="w-full gap-1">
                <div className="text-muted-foreground/70 flex flex-row items-center gap-1 px-2 pb-1 text-xs font-semibold opacity-70">
                    {groupIcon}
                    {title}
                </div>
                {threads.length === 0 && renderEmptyState ? (
                    renderEmptyState()
                ) : (
                    <Flex className="border-border/50 w-full gap-0" gap="none" direction="col">
                        {threads.map(thread => (
                            <HistoryItem
                                thread={thread}
                                isPinned={thread.pinned}
                                key={thread.id}
                                dismiss={() => {
                                    setIsSidebarOpen(() => false);
                                }}
                                isActive={thread.id === currentThreadId}
                            />
                        ))}
                    </Flex>
                )}
            </Flex>
        );
    };

    const CreditsUsageBox = () => {
        const remainingCreditsRaw = useChatStore(state => state.creditLimit.remaining);
        const maxLimitRaw = useChatStore(state => state.creditLimit.maxLimit);
        const resetDate = useChatStore(state => state.creditLimit.reset);
        const remainingCredits = typeof remainingCreditsRaw === 'number' ? remainingCreditsRaw : 0;
        const maxLimit = typeof maxLimitRaw === 'number' ? maxLimitRaw : 0;
        const percent =
            maxLimit > 0 ? Math.min(100, Math.round((remainingCredits / maxLimit) * 100)) : 0;

        return (
            <div className=" flex flex-col gap-1 rounded-lg border-t p-3 text-xs">
                <div className="text-muted-foreground flex items-center justify-between gap-1 font-medium">
                    <div className="flex items-center gap-1">
                        <ZapIcon size={14} strokeWidth={2} className="text-muted-foreground/50" />
                        Usage
                        <Tooltip content={`Reset in ${moment(resetDate).fromNow()}`}>
                            <InfoIcon
                                size={14}
                                strokeWidth={2}
                                className="text-muted-foreground/50"
                            />
                        </Tooltip>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <span className="text-foreground font-semibold">{remainingCredits}</span>
                        <span className="text-muted-foreground/50">/ {maxLimit}</span>
                    </div>
                </div>

                {/* <div className="bg-muted relative mt-1 h-1 w-full rounded">
                    <div
                        className="bg-foreground absolute left-0 top-0 h-1 rounded transition-all"
                        style={{ width: `${percent - 4}%` }}
                    />
                </div> */}
            </div>
        );
    };

    const pinnedThreads = threads
        .filter(thread => thread.pinned)
        .sort((a, b) => b.pinnedAt.getTime() - a.pinnedAt.getTime());
    const recentThreads = threads.filter(thread => !thread.pinned);

    return (
        <div
            className={cn(
                ' border-border relative flex h-[100dvh] w-[240px] flex-col border-r transition-all duration-200',
                !isSidebarOpen && 'w-[56px]'
            )}
        >
            <div
                className={cn(
                    'flex flex-row justify-between border-b px-2 py-1.5',
                    !isSidebarOpen && 'justify-center'
                )}
            >
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => push('/chat')}
                    className={cn('justify-start px-1.5', !isSidebarOpen && 'justify-center')}
                >
                    <Logo className="size-5" />
                    {isSidebarOpen && <span className="text-sm font-medium">LLMChat</span>}
                </Button>
                {isSidebarOpen && (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setIsSidebarOpen(prev => !prev)}
                    >
                        <PanelLeft
                            size={16}
                            strokeWidth={2}
                            aria-hidden={!isSidebarOpen}
                            className="!text-muted-foreground/50"
                        />
                    </Button>
                )}
            </div>
            {/* Top Section: Logo, Nav, New Thread */}
            <div className="flex flex-col gap-2 p-2">
                <nav className="flex flex-col gap-0">
                    <Button
                        variant={pathname === '/chat' ? 'secondary' : 'ghost'}
                        size="sm"
                        className={cn('justify-start px-2', !isSidebarOpen && 'justify-center')}
                        onClick={() => push('/chat')}
                    >
                        <HouseIcon
                            size={16}
                            strokeWidth={2}
                            className="!text-muted-foreground/50"
                        />
                        {isSidebarOpen && <span>Home</span>}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn('justify-start px-2', !isSidebarOpen && 'justify-center')}
                        onClick={() => setIsCommandSearchOpen(true)}
                    >
                        <Command size={16} strokeWidth={2} className="!text-muted-foreground/50" />
                        {isSidebarOpen && <span>Search</span>}
                    </Button>

                    <Button
                        variant={pathname === '/settings' ? 'secondary' : 'ghost'}
                        size="sm"
                        className={cn('justify-start px-2', !isSidebarOpen && 'justify-center')}
                        onClick={() => push('/settings')}
                    >
                        <BoltIcon size={16} strokeWidth={2} className="!text-muted-foreground/50" />
                        {isSidebarOpen && <span>Settings</span>}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn('justify-start px-2', !isSidebarOpen && 'justify-center')}
                        onClick={() => push('/recent')}
                    >
                        <HistoryIcon
                            size={16}
                            strokeWidth={2}
                            className="!text-muted-foreground/50"
                        />
                        {isSidebarOpen && <span>Recent Chats</span>}
                    </Button>
                </nav>
            </div>

            {/* Threads Section */}
            {!isSidebarOpen && pinnedThreads.length > 0 && (
                <div className={cn('border-t p-2', !isSidebarOpen && 'px-1')}>
                    {renderGroup({
                        title: 'Pinned History',
                        threads: pinnedThreads,
                        groupIcon: <PinIcon size={14} strokeWidth={2} />,
                        renderEmptyState: () => (
                            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg p-2">
                                <p className="text-muted-foreground text-xs opacity-50">
                                    No pinned threads
                                </p>
                            </div>
                        ),
                    })}
                </div>
            )}

            <div
                className={cn(
                    'no-scrollbar flex-1 overflow-y-auto border-t p-2',
                    !isSidebarOpen && 'px-1'
                )}
            >
                {isSidebarOpen &&
                    renderGroup({
                        title: 'Recent History',
                        threads: threads.filter(thread => !thread.pinned),
                    })}
            </div>

            {/* Bottom Section: Account, Plan Usage, Support */}
            <div className="flex flex-col gap-2 border-t p-2">
                {!isSidebarOpen && (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="justify-center px-2"
                        onClick={() => setIsSidebarOpen(prev => !prev)}
                    >
                        <ArrowRight
                            size={16}
                            strokeWidth={2}
                            className="!text-muted-foreground/50"
                        />
                    </Button>
                )}
                {isSignedIn ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start px-2"
                                onClick={() => setIsCommandSearchOpen(true)}
                            >
                                <div className="bg-brand flex size-6 items-center justify-center rounded-full">
                                    {user && user.hasImage ? (
                                        <img
                                            src={user?.imageUrl ?? ''}
                                            className="size-full rounded-full"
                                            alt={user?.fullName ?? ''}
                                        />
                                    ) : (
                                        <UserIcon
                                            size={16}
                                            strokeWidth={2}
                                            className="text-background"
                                        />
                                    )}
                                </div>
                                {isSidebarOpen && (
                                    <span className="text-sm font-medium">{user?.fullName}</span>
                                )}
                                {isSidebarOpen && <div className="flex flex-1"></div>}

                                {isSidebarOpen && (
                                    <ChevronDownIcon
                                        size={14}
                                        strokeWidth={2}
                                        aria-hidden
                                        className="text-muted-foreground"
                                    />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                                <SettingsIcon size={16} strokeWidth={2} />
                                Settings
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => openUserProfile()}>
                                <UserIcon size={16} strokeWidth={2} />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => signOut()}>
                                <LogOutIcon size={16} strokeWidth={2} />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        <Button size="sm" rounded="lg" onClick={() => push('/sign-in')}>
                            {isSidebarOpen ? (
                                'Log in / Sign up'
                            ) : (
                                <UserIcon size={14} strokeWidth={2} />
                            )}
                        </Button>
                    </div>
                )}
                <nav className="flex flex-col gap-0">
                    <Popover open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    'justify-start px-2',
                                    !isSidebarOpen && 'justify-center'
                                )}
                            >
                                <ThumbsUp
                                    size={16}
                                    strokeWidth={2}
                                    className="!text-muted-foreground/50"
                                />
                                {isSidebarOpen && <span>Give Feedback</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            side="bottom"
                            className="flex w-80 max-w-xs flex-col bg-white p-0"
                        >
                            <FeedbackWidget onClose={() => setIsFeedbackOpen(false)} />
                        </PopoverContent>
                    </Popover>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    'justify-start px-2',
                                    !isSidebarOpen && 'justify-center'
                                )}
                                onClick={() => push('/chat')}
                            >
                                <CircleHelp
                                    size={16}
                                    strokeWidth={2}
                                    className="!text-muted-foreground/50"
                                />
                                {isSidebarOpen && <span>Help & Support</span>}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => setIsFaqOpen(true)}>
                                <HelpCircle size={16} strokeWidth={2} />
                                FAQs
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Mail size={16} strokeWidth={2} />
                                Contact Us
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Logs size={16} strokeWidth={2} />
                                Changelog
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>
            </div>
            {isSidebarOpen && <CreditsUsageBox />}
            <FaqDialog />
        </div>
    );
};
