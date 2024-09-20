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
    "relative flex flex-1 flex-col h-[98dvh] w-full overflow-hidden rounded-md bg-zinc-25 shadow-sm dark:border dark:border-white/5 dark:bg-zinc-800";
  const settingsContainerClass =
    "overflow-hidden h-[98dvh] w-full rounded-md bg-white shadow-sm dark:border dark:border-white/5 dark:bg-zinc-800";

  return (
    <div className="flex min-h-[98dvh] w-full flex-row overflow-hidden bg-zinc-50 dark:bg-zinc-900">
      <AnimatePresence>
        <Sidebar />
        {isChatPage && isSidebarOpen && <HistorySidebar />}
        {isSettingsPage && <SettingsSidebar />}
      </AnimatePresence>
      <Flex className="w-full">
        <motion.div className="flex flex-1 gap-0 overflow-hidden pr-2 pt-2">
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
