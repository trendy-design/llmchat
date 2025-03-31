'use client';
import { SignIn } from '@clerk/nextjs';
import { CommandSearch, SettingsModal, Sidebar } from '@repo/common/components';
import { useRootContext } from '@repo/common/context';
import { AgentProvider } from '@repo/common/hooks';
import { useAppStore } from '@repo/common/store';
import { Flex, Toaster } from '@repo/ui';
import { IconMoodSadDizzy } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { FC } from 'react';
import { Drawer } from 'vaul';

export type TRootLayout = {
    children: React.ReactNode;
};

export const RootLayout: FC<TRootLayout> = ({ children }) => {
    const { isSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen } = useRootContext();
    const setIsSettingOpen = useAppStore(state => state.setIsSettingsOpen);
    const showSignInModal = useAppStore(state => state.showSignInModal);

    const containerClass =
        'relative flex flex-1 flex-col h-[calc(100dvh)] border border-border rounded-l-sm bg-secondary w-full overflow-hidden shadow-sm';

    if (showSignInModal) {
        return (
            <div className="bg-secondary flex min-h-[96dvh] w-full flex-row overflow-hidden">
                <SignIn />
            </div>
        );
    }

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
            <Flex className="w-full">
                <motion.div className="flex flex-1 gap-0 overflow-hidden">
                    <AgentProvider>
                        <div className={containerClass}>
                            <div className="relative flex h-full w-full flex-row">
                                <div className=" flex w-full flex-col gap-2 overflow-y-auto">
                                    <div className="from-secondary to-secondary/0 via-secondary/70 absolute left-0 right-0 top-0 z-40 flex flex-row items-center justify-center gap-1 bg-gradient-to-b p-2 pb-12"></div>
                                    {/* Auth Button Header */}

                                    {children}
                                </div>
                            </div>
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
