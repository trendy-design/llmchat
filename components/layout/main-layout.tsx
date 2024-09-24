"use client";
import { useRootContext } from "@/libs/context/root";
import { cn } from "@/libs/utils/clsx";
import { Flex } from "@/ui";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Drawer } from "vaul";
import { ApiKeyModal } from "../api-key-modal";
import { CommandSearch } from "../command-search";
import { HistorySidebar } from "../history/history-side-bar";
import { Toaster } from "../ui/toaster";
import { SettingsSidebar } from "./settings-sidebar";

export type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout = ({ children }: MainLayoutProps) => {
  const pathname = usePathname();
  const { isSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen } =
    useRootContext();

  const isChatPage = pathname.startsWith("/chat");
  const isSettingsPage = pathname.startsWith("/settings");
  const mainContainerClass =
    "relative flex flex-1 flex-col h-[98dvh] w-full overflow-hidden rounded-md bg-zinc-25 shadow-sm dark:border dark:border-white/5 dark:bg-zinc-800";
  const settingsContainerClass =
    "overflow-hidden h-[98dvh] w-full rounded-md bg-white shadow-sm dark:border dark:border-white/5 dark:bg-zinc-800";

  return (
    <div className="flex min-h-[98dvh] w-full flex-row gap-0.5 overflow-hidden bg-zinc-50 dark:bg-zinc-900">
      <Flex className="hidden lg:flex">
        <AnimatePresence>
          {!isSettingsPage && isSidebarOpen && <HistorySidebar />}
          {isSettingsPage && <SettingsSidebar />}
        </AnimatePresence>
      </Flex>
      <Drawer.Root
        open={isMobileSidebarOpen}
        direction="left"
        shouldScaleBackground
        onOpenChange={setIsMobileSidebarOpen}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-30 bg-zinc-500/70 backdrop-blur-sm" />
          <Drawer.Content className={cn("fixed bottom-0 left-0 top-0 z-[50]")}>
            <Flex className="bg-zinc-50 pr-2">
              {isChatPage && <HistorySidebar />}
              {isSettingsPage && <SettingsSidebar />}
            </Flex>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <Flex className="w-full">
        <motion.div className="flex flex-1 gap-0 overflow-hidden p-0 md:px-2 md:pt-2">
          <div
            className={cn(
              isSettingsPage ? settingsContainerClass : mainContainerClass,
            )}
          >
            {children}
          </div>
        </motion.div>
        <ApiKeyModal />
        <CommandSearch />
      </Flex>
      <Toaster />
    </div>
  );
};
