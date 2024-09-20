"use client";
import { useRootContext } from "@/libs/context/root";
import { cn } from "@/libs/utils/clsx";
import { Flex } from "@/ui";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ApiKeyModal } from "../api-key-modal";
import { CommandSearch } from "../command-search";
import { HistorySidebar } from "../history/history-side-bar";
import { Toaster } from "../ui/toaster";
import { SettingsSidebar } from "./settings-sidebar";
import { Sidebar } from "./sidebar";

export type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout = ({ children }: MainLayoutProps) => {
  const pathname = usePathname();
  const { isSidebarOpen } = useRootContext();

  const isChatPage = pathname.startsWith("/chat");
  const isSettingsPage = pathname.startsWith("/settings");
  const mainContainerClass =
    "relative flex flex-1 flex-col h-[99dvh] w-full overflow-hidden rounded-t-lg bg-zinc-25 shadow-sm dark:border dark:border-white/5 dark:bg-zinc-800";
  const settingsContainerClass =
    "overflow-hidden h-[98dvh] rounded-t-md bg-white shadow-sm dark:border dark:border-white/5 dark:bg-zinc-800";

  return (
    <div className="flex min-h-[100dvh] w-full flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-900 md:flex-row">
      <Sidebar />
      <Flex className="flex-1 gap-0 overflow-hidden">
        <AnimatePresence>
          {isChatPage && isSidebarOpen && <HistorySidebar />}
        </AnimatePresence>
        {isSettingsPage && <SettingsSidebar />}
        <motion.div className="flex-1 pr-2 pt-2">
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
