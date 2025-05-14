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

import { DesktopDraggable } from '@repo/common/components';
import { isDesktop } from '@repo/common/electron';
import { useIsMobile } from '@repo/common/hooks';
import { AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    BoltIcon,
    ChevronDownIcon,
    CircleHelp,
    Command,
    HelpCircle,
    HistoryIcon,
    InfoIcon,
    LogOutIcon,
    Logs,
    Mail,
    PanelLeft,
    PinIcon,
    SquarePen,
    ThumbsUp,
    UserIcon,
    ZapIcon,
} from 'lucide-react';
import moment from 'moment';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Drawer } from 'vaul';
import { FeedbackWidget } from './feedback-widget';
import { FaqDialog } from './information/faq';
const CreditsUsageBox = () => {
    const remainingCreditsRaw = useChatStore(state => state.creditLimit.remaining);
    const maxLimitRaw = useChatStore(state => state.creditLimit.maxLimit);
    const resetDate = useChatStore(state => state.creditLimit.reset);
    const remainingCredits = typeof remainingCreditsRaw === 'number' ? remainingCreditsRaw : 0;
    const maxLimit = typeof maxLimitRaw === 'number' ? maxLimitRaw : 0;

    return (
        <div className=" flex flex-col gap-1 rounded-lg border-t p-3 text-xs">
            <div className="text-muted-foreground flex items-center justify-between gap-1 font-medium">
                <div className="flex items-center gap-1">
                    <ZapIcon size={14} strokeWidth={2} className="text-muted-foreground/50" />
                    Usage
                    <Tooltip content={`Reset in ${moment(resetDate).fromNow()}`}>
                        <InfoIcon size={14} strokeWidth={2} className="text-muted-foreground/50" />
                    </Tooltip>
                </div>
                <div className="flex items-center gap-1 text-xs">
                    <span className="text-foreground font-semibold">{remainingCredits}</span>
                    <span className="text-muted-foreground/50">/ {maxLimit}</span>
                </div>
            </div>
        </div>
    );
};

export const Sidebar = () => {
    const isDesktopApp = isDesktop();
    const { threadId: currentThreadId } = useParams();
    const pathname = usePathname();
    const { setIsCommandSearchOpen } = useRootContext();
    const threads = useChatStore(state => state.threads);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const { isSignedIn, user, isLoaded } = useUser();
    const { openUserProfile, signOut, redirectToSignIn, addListener } = useClerk();
    const setIsSidebarOpen = useAppStore(state => state.setIsSidebarOpen);
    const isSidebarOpen = useAppStore(state => state.isSidebarOpen);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const setIsFaqOpen = useAppStore(state => state.setIsFaqOpen);
    const { push } = useRouter();
    const isMobile = useIsMobile();

    const groupedThreads: Record<string, Thread[]> = {
        today: [],
        yesterday: [],
        last7Days: [],
        last30Days: [],
        previousMonths: [],
    };

    const sortThreads = (threads: Thread[], sortBy: 'createdAt') => {
        return [...threads].sort((a, b) => moment(b[sortBy]).diff(moment(a[sortBy])));
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

    const pinnedThreads = threads
        .filter(thread => thread.pinned)
        .sort((a, b) => b.pinnedAt.getTime() - a.pinnedAt.getTime());
    const recentThreads = threads.filter(thread => !thread.pinned);

    if (!isSidebarOpen && isMobile) {
        return null;
    }

    return (
        <>
            <div
                className={cn(
                    'flex flex-row justify-between px-2 pt-1.5',
                    !isSidebarOpen && 'justify-center'
                )}
            >
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => push('/chat')}
                    className={cn('justify-start px-1.5', !isSidebarOpen && 'justify-center')}
                >
                    <Logo className="size-5 dark:text-blue-400" />
                    {isSidebarOpen && <span className="text-sm font-medium">LLMChat</span>}
                </Button>
            </div>
            <div className="flex flex-col gap-2 p-2">
                <nav className="flex flex-col gap-0">
                    <Button
                        variant={pathname === '/chat' ? 'secondary' : 'ghost'}
                        size="sm"
                        className={cn('justify-start px-2', !isSidebarOpen && 'justify-center')}
                        onClick={() => push('/chat')}
                    >
                        <SquarePen
                            size={16}
                            strokeWidth={2}
                            className="!text-muted-foreground/50"
                        />
                        {isSidebarOpen && <span>New Thread</span>}
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
                                className={cn(
                                    'justify-start px-2',
                                    !isSidebarOpen && 'justify-center'
                                )}
                                onClick={() => setIsCommandSearchOpen(true)}
                            >
                                <div className="flex size-6 items-center justify-center rounded-full bg-orange-500/30">
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
                                            className="text-orange-400"
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
                            className="bg-popover flex w-80 max-w-xs flex-col p-0"
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
        </>
    );
};

export const ResponsiveSidebar = () => {
    const isSidebarOpen = useAppStore(state => state.isSidebarOpen);
    const setIsSidebarOpen = useAppStore(state => state.setIsSidebarOpen);
    const isMobile = useIsMobile();
    const isDesktopApp = isDesktop();

    if (isMobile) {
        return (
            <Drawer.Root
                open={isSidebarOpen}
                direction="left"
                shouldScaleBackground
                onOpenChange={() => setIsSidebarOpen(prev => !prev)}
            >
                <Button
                    variant="ghost"
                    className={cn('absolute top-2 z-10', isDesktopApp ? 'left-20' : 'left-2')}
                    size="icon-sm"
                    onClick={() => setIsSidebarOpen(prev => !prev)}
                >
                    <PanelLeft size={16} strokeWidth={2} className="!text-muted-foreground/50" />
                    {isDesktopApp && <span>isToDesktop</span>}
                </Button>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-30 backdrop-blur-sm" />
                    <Drawer.Content className="fixed bottom-0 left-0 top-0 z-[50]">
                        <Flex className="pr-2">
                            <SidebarBody>
                                <Sidebar />
                            </SidebarBody>
                        </Flex>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        );
    }

    return (
        <Flex className="hidden lg:flex">
            <AnimatePresence>
                <SidebarBody>
                    <Sidebar />
                </SidebarBody>
            </AnimatePresence>
        </Flex>
    );
};

type SidebarBodyProps = {
    children: React.ReactNode;
};
export const SidebarBody = ({ children }: SidebarBodyProps) => {
    const isDesktopApp = isDesktop();
    const isSidebarOpen = useAppStore(state => state.isSidebarOpen);
    const setIsSidebarOpen = useAppStore(state => state.setIsSidebarOpen);
    const isMobile = useIsMobile();

    return (
        <div
            className={cn(
                'border-border bg-tertiary relative flex h-[100dvh] w-[240px] flex-col border-r transition-all duration-200',
                !isSidebarOpen && (isMobile ? 'w-0' : 'w-[76px]')
            )}
        >
            <DesktopDraggable />
            {isSidebarOpen && (
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="not-draggable absolute right-2 top-2 z-[20] cursor-pointer"
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

            {isDesktopApp && <div className="h-8 w-full" />}
            {children}
        </div>
    );
};
