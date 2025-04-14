'use client';
import {
    CommandSearch,
    FeedbackWidget,
    IntroDialog,
    SettingsModal,
    Sidebar,
} from '@repo/common/components';
import { useRootContext } from '@repo/common/context';
import { AgentProvider } from '@repo/common/hooks';
import { useAppStore } from '@repo/common/store';
import { plausible } from '@repo/shared/utils';
import { Badge, Button, Flex, Toaster } from '@repo/ui';
import { IconMoodSadDizzy, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { FC, useEffect } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';
import { Drawer } from 'vaul';

export type TRootLayout = {
    children: React.ReactNode;
};

export const RootLayout: FC<TRootLayout> = ({ children }) => {
    const { isSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen } = useRootContext();
    const setIsSettingOpen = useAppStore(state => state.setIsSettingsOpen);

    const containerClass =
        'relative flex flex-1 flex-row h-[calc(99dvh)] border border-border rounded-sm bg-secondary w-full overflow-hidden shadow-sm';

    useEffect(() => {
        plausible.trackPageview();
    }, []);

    return (
        <div className="bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden">
            <div className="bg-tertiary item-center fixed inset-0 z-[99999] flex justify-center md:hidden">
                <div className="flex flex-col items-center justify-center gap-2">
                    <IconMoodSadDizzy size={24} strokeWidth={2} className="text-muted-foreground" />
                    <span className="text-muted-foreground text-center text-sm">
                        Mobile version is coming soon.
                        <br /> Please use a desktop browser.
                    </span>
                </div>
            </div>
            <Flex className="hidden lg:flex">
                <AnimatePresence>{isSidebarOpen && <Sidebar />}</AnimatePresence>
            </Flex>

            <Drawer.Root
                open={isMobileSidebarOpen}
                direction="left"
                shouldScaleBackground
                onOpenChange={setIsMobileSidebarOpen}
            >
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-30 backdrop-blur-sm" />
                    <Drawer.Content className="fixed bottom-0 left-0 top-0 z-[50]">
                        <Flex className="pr-2">
                            <Sidebar />
                        </Flex>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>

            {/* Main Content */}
            <Flex className="flex-1 overflow-hidden">
                <motion.div className="flex w-full py-1 pr-1">
                    <AgentProvider>
                        <div className={containerClass}>
                            <div className="relative flex h-full w-0 flex-1 flex-row">
                                <div className="flex w-full flex-col gap-2 overflow-y-auto">
                                    <div className="from-secondary to-secondary/0 via-secondary/70 absolute left-0 right-0 top-0 z-40 flex flex-row items-center justify-center gap-1 bg-gradient-to-b p-2 pb-12"></div>
                                    {/* Auth Button Header */}

                                    {children}
                                </div>
                            </div>
                            <SideDrawer />
                            <FeedbackWidget />
                            <IntroDialog />
                        </div>
                    </AgentProvider>
                </motion.div>
                <SettingsModal />
                <CommandSearch />
            </Flex>

            <Toaster />
        </div>
    );
};

export const SideDrawer = () => {
    const pathname = usePathname();
    const sideDrawer = useAppStore(state => state.sideDrawer);
    const dismissSideDrawer = useAppStore(state => state.dismissSideDrawer);
    const { scrollRef, contentRef } = useStickToBottom({
        stiffness: 1,
        damping: 0,
    });
    const isThreadPage = pathname.startsWith('/chat/');

    return (
        <AnimatePresence>
            {sideDrawer.open && isThreadPage && (
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        exit: { duration: 0.2 },
                    }}
                    className="flex min-h-[99dvh] w-[500px] shrink-0 flex-col overflow-hidden py-1.5 pl-0.5 pr-1.5"
                >
                    <div className="bg-background border-border shadow-subtle-xs flex h-full w-full flex-col overflow-hidden rounded-lg">
                        <div className="border-border flex flex-row items-center justify-between gap-2 border-b py-1.5 pl-4 pr-2">
                            <div className="text-sm font-medium">
                                {typeof sideDrawer.title === 'function'
                                    ? sideDrawer.title()
                                    : sideDrawer.title}
                            </div>
                            {sideDrawer.badge && (
                                <Badge variant="default">{sideDrawer.badge}</Badge>
                            )}
                            <div className="flex-1" />
                            <Button
                                variant="secondary"
                                size="icon-xs"
                                onClick={() => dismissSideDrawer()}
                                tooltip="Close"
                            >
                                <IconX size={14} strokeWidth={2} />
                            </Button>
                        </div>
                        <div
                            className="no-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto p-2"
                            ref={scrollRef}
                        >
                            <div ref={contentRef} className="w-full">
                                {sideDrawer.renderContent()}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
