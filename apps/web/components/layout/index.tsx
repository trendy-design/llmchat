"use client";
import { useRootContext } from "@/libs/context/root";
import { Flex, Toaster } from "@repo/ui";
import { AnimatePresence, motion } from "framer-motion";
import { FC } from "react";
import { Drawer } from "vaul";
import { ApiKeyModal } from "../api-key-modal";
import { CommandSearch } from "../command-search";
import { Sidebar } from "./side-bar";

export type TRootLayout = {
  children: React.ReactNode;
};

export const RootLayout: FC<TRootLayout> = ({ children }) => {
  const { isSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen } =
    useRootContext();

  const containerClass =
    "relative flex flex-1 flex-col h-[100dvh] w-full overflow-hidden bg-white shadow-sm dark:border dark:border-white/5 dark:bg-zinc-800";

  return (
    <div className="flex min-h-[98dvh] w-full flex-row overflow-hidden bg-zinc-50 dark:bg-zinc-900">
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
          <Drawer.Overlay className="fixed inset-0 z-30 bg-zinc-500/70 backdrop-blur-sm" />
          <Drawer.Content className="fixed bottom-0 left-0 top-0 z-[50]">
            <Flex className="bg-zinc-50 pr-2">
              <Sidebar />
            </Flex>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Main Content */}
      <Flex className="w-full">
        <motion.div className="flex flex-1 gap-0 overflow-hidden p-0">
          <div className={containerClass}>{children}</div>
        </motion.div>
        <ApiKeyModal />
        <CommandSearch />
      </Flex>

      <Toaster />
    </div>
  );
};
