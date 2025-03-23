'use client';
import { AgentProvider } from '@/hooks/agent-provider';
import { useRootContext } from '@/libs/context/root';
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { Button, Flex, Toaster } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { FC } from 'react';
import { Drawer } from 'vaul';
import { CommandSearch } from '../command-search';
import { Sidebar } from './side-bar';

export type TRootLayout = {
  children: React.ReactNode;
};

export const RootLayout: FC<TRootLayout> = ({ children }) => {
  const { isSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen } = useRootContext();
  const { isSignedIn } = useAuth();

  const containerClass =
    'relative flex flex-1 flex-col h-[100dvh] bg-secondary w-full overflow-hidden shadow-sm';

  return (
    <div className="flex min-h-[96dvh] bg-secondary w-full flex-row overflow-hidden">
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
              <div className="flex flex-row h-full w-full">
                <div className="flex flex-col w-full gap-2 overflow-y-auto">
                  {/* Auth Button Header */}
                  <div className="fixed top-3 right-3 z-50 flex items-center gap-4">
                    {isSignedIn ? (
                      <UserButton 
                        appearance={{
                          elements: {
                            avatarBox: "size-7"
                          }
                        }}
                      />
                    ) : (
                      <SignInButton mode="modal">
                        <Button variant="default" size="sm" rounded="full">
                          Sign in
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
        <CommandSearch />
      </Flex>

      <Toaster />
    </div>
  );
};
