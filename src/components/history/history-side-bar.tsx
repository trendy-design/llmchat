import { Button, Flex, Tooltip } from "@/components/ui";
import { useSessions } from "@/context/sessions";
import { sortSessions } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { SidebarLeftIcon } from "@hugeicons/react";
import { ClockCounterClockwise, X } from "@phosphor-icons/react";
import { useState } from "react";
import { Drawer } from "vaul";
import { HistoryItem } from "./history-item";

export const HistorySidebar = () => {
  const { sessions } = useSessions();
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root direction="left" open={open} onOpenChange={setOpen}>
      <Tooltip content="Chat History" side="left" sideOffset={4}>
        <Drawer.Trigger asChild>
          <Button variant="ghost" size="iconSm">
            <SidebarLeftIcon size={20} variant="stroke" strokeWidth="2" />
          </Button>
        </Drawer.Trigger>
      </Tooltip>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[10] bg-zinc-500/70 dark:bg-zinc-900/70 backdrop-blur-sm" />
        <Drawer.Content
          className={cn(
            "flex flex-col rounded-3xl outline-none h-[98dvh] w-[320px] fixed z-[901] md:bottom-2 left-2 top-2 "
          )}
        >
          <div className="bg-white dark:bg-zinc-800 h-[98dvh] dark:border dark:border-white/5 flex flex-row rounded-2xl flex-1 p-2 relative">
            <div className="flex flex-col w-full overflow-y-auto no-scrollbar">
              <div className="flex flex-row justify-between">
                <div className="p-2">
                  <Flex
                    className="text-sm text-zinc-500"
                    items="center"
                    gap="sm"
                  >
                    <ClockCounterClockwise size={18} weight="bold" /> Recent
                    History
                  </Flex>
                </div>

                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <X size={18} weight="bold" />
                </Button>
              </div>

              {sortSessions(sessions, "updatedAt")?.map((session) => (
                <HistoryItem
                  session={session}
                  key={session.id}
                  dismiss={() => {
                    setOpen(false);
                  }}
                />
              ))}
            </div>
            <div className="flex flex-col h-full justify-center items-center absolute right-[-20px] w-4">
              <div className="w-1 h-4 flex-shrink-0 rounded-full bg-white/50 mb-4" />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
