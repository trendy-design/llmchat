import { useSessions } from "@/lib/context";
import { sortSessions } from "@/lib/utils/utils";
import { Button, Flex, Tooltip, Type } from "@/ui";
import { History, X } from "lucide-react";
import { useState } from "react";
import { Drawer } from "vaul";
import { HistoryItem } from "./history-item";

export const HistorySidebar = () => {
  const { sessions } = useSessions();
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root direction="right" open={open} onOpenChange={setOpen}>
      <Tooltip content="Chat History" side="bottom" sideOffset={4}>
        <Drawer.Trigger asChild>
          <Button variant="ghost" size="iconSm">
            <History size={18} strokeWidth={2} />
          </Button>
        </Drawer.Trigger>
      </Tooltip>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[10] bg-zinc-500/70 backdrop-blur-sm dark:bg-zinc-900/70" />
        <Drawer.Content className="fixed right-2 top-2 z-[901] flex h-[98dvh] w-[320px] flex-col rounded-3xl outline-none md:bottom-2">
          <div className="relative flex h-[98dvh] flex-1 flex-row rounded-lg bg-white dark:border dark:border-white/5 dark:bg-zinc-800">
            <Flex
              direction="col"
              className="no-scrollbar w-full overflow-y-auto"
            >
              <Flex
                justify="between"
                items="center"
                className="w-ful w-full border-b border-zinc-500/10 py-2 pl-3 pr-2"
              >
                <Flex items="center" gap="sm">
                  <History
                    size={16}
                    strokeWidth={2}
                    className="text-zinc-500"
                  />
                  <Type size="sm" weight="medium" textColor="secondary">
                    Recent History
                  </Type>
                </Flex>

                <Button
                  variant="ghost"
                  size="iconXS"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <X size={16} strokeWidth={2} />
                </Button>
              </Flex>

              <Flex className="w-full p-1.5" gap="xs" direction="col">
                {sortSessions(sessions, "createdAt")?.map((session) => (
                  <HistoryItem
                    session={session}
                    key={session.id}
                    dismiss={() => {
                      setOpen(false);
                    }}
                  />
                ))}
              </Flex>
            </Flex>
            <div className="absolute right-[-20px] flex h-full w-4 flex-col items-center justify-center">
              <div className="mb-4 h-4 w-1 flex-shrink-0 rounded-full bg-white/50" />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
