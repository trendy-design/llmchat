import { useSessionsContext } from "@/context/sessions/provider";
import { sortSessions } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { Plus, SidebarSimple } from "@phosphor-icons/react";
import { useState } from "react";
import { Drawer } from "vaul";
import { Button } from "../ui/button";
import { HistoryItem } from "./history-item";

export const HistorySidebar = () => {
  const { sessions, createSession, currentSession } = useSessionsContext();
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root direction="left" open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="ghost" size="iconSm">
          <SidebarSimple size={20} weight="bold" />
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[400] bg-zinc-500/70 dark:bg-zinc-900/70 backdrop-blur-sm" />
        <Drawer.Content
          className={cn(
            "flex flex-col rounded-3xl outline-none h-[98dvh] w-[280px] fixed z-[901] md:bottom-2 left-2 top-2 "
          )}
        >
          <div className="bg-white dark:bg-zinc-700 h-[98dvh] dark:border dark:border-white/5 flex flex-row rounded-2xl flex-1 p-2 relative">
            <div className="flex flex-col w-full overflow-y-auto no-scrollbar">
              <div className="flex flex-row justify-between">
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <SidebarSimple size={20} weight="bold" />
                </Button>
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => {
                    createSession({
                      redirect: true,
                    });
                    setOpen(false);
                  }}
                >
                  <Plus size={20} weight="bold" />
                </Button>
              </div>
              <div className="p-2 mt-2">
                <p className="text-sm text-zinc-500">Recent History</p>
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
