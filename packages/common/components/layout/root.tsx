'use client';
import { SignIn, SignInButton, useAuth, UserButton } from '@clerk/nextjs';
import { CommandSearch, SettingsModal, Sidebar } from '@repo/common/components';
import { useRootContext } from '@repo/common/context';
import { AgentProvider } from '@repo/common/hooks';
import { useAppStore } from '@repo/common/store';
import { Button, Flex, Toaster } from '@repo/ui';
import { IconMoodSadDizzy } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { FC } from 'react';
import { Drawer } from 'vaul';

export type TRootLayout = {
    children: React.ReactNode;
};

export const RootLayout: FC<TRootLayout> = ({ children }) => {
    const { isSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen } = useRootContext();
    const { isSignedIn } = useAuth();
    const setIsSettingOpen = useAppStore(state => state.setIsSettingsOpen);
    const showSignInModal = useAppStore(state => state.showSignInModal);

    const containerClass =
        'relative flex flex-1 flex-col h-[100dvh] bg-secondary w-full overflow-hidden shadow-sm';

    if (showSignInModal) {
        return (
            <div className="bg-secondary flex min-h-[96dvh] w-full flex-row overflow-hidden">
                <SignIn />
            </div>
        );
    }

    return (
        <div className="bg-secondary flex h-[100dvh] w-full flex-row overflow-hidden">
            <div className="bg-secondary item-center fixed inset-0 z-[99999] flex justify-center md:hidden">
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
                <motion.div className="flex flex-1 gap-0 overflow-hidden p-0">
                    <AgentProvider>
                        <div className={containerClass}>
                            <div className="flex h-full w-full flex-row">
                                <div className="flex w-full flex-col gap-2 overflow-y-auto">
                                    {/* <div className="from-secondary to-secondary/0 via-secondary/70 fixed left-0 right-0 top-0 z-40 flex flex-row items-center justify-center gap-1 bg-gradient-to-b p-2 pb-12">
                                        <p className="text-muted-foreground/50 font-mono text-sm font-medium tracking-tight">
                                            deep.new
                                        </p>
                                    </div> */}
                                    {/* Auth Button Header */}
                                    <div className="fixed right-0 top-0 z-50 flex items-center gap-1 px-4 py-2">
                                        {isSignedIn ? (
                                            <UserButton
                                                appearance={{
                                                    elements: {
                                                        avatarBox: 'size-5 bg-muted-foreground',
                                                        userButtonAvatarBox: 'bg-muted-foreground',
                                                        userPreviewAvatarIcon:
                                                            'bg-muted-foreground',
                                                    },
                                                }}
                                            />
                                        ) : (
                                            <SignInButton mode="modal">
                                                <Button variant="default" size="sm" rounded="full">
                                                    Log in
                                                </Button>
                                            </SignInButton>
                                        )}
                                    </div>
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
