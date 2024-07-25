import { Button, Flex, Tooltip, Type } from "@/components/ui";
import { useSessions } from "@/context/sessions";
import { sortSessions } from "@/helper/utils";
import { MessageMultiple01Icon } from "@hugeicons/react";
import { X } from "@phosphor-icons/react";
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
            <MessageMultiple01Icon size={20} strokeWidth={2}/>
          </Button>
        </Drawer.Trigger>
      </Tooltip>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[10] bg-zinc-500/70 backdrop-blur-sm dark:bg-zinc-900/70" />
        <Drawer.Content className="fixed left-2 top-2 z-[901] flex h-[98dvh] w-[320px] flex-col rounded-3xl outline-none md:bottom-2">
          <div className="relative flex h-[98dvh] flex-1 flex-row rounded-2xl bg-white dark:border dark:border-white/5 dark:bg-zinc-800">
            <Flex
              direction="col"
              className="w-full overflow-y-auto no-scrollbar"
            >
              <Flex
                justify="between"
                items="center"
                className="w-full py-2 pl-3 pr-2 border-b w-ful border-zinc-500/10"
              >
                <Flex items="center" gap="sm">
                <MessageMultiple01Icon size={20} strokeWidth={2} className="text-zinc-500"/>
                <Type size="sm" weight="medium" textColor="secondary">
               Recent History</Type>
                </Flex>

                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <X size={18} weight="bold" />
                </Button>
              </Flex>

              <Flex className="w-full p-2" gap="xs" direction="col">
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
              <div className="flex-shrink-0 w-1 h-4 mb-4 rounded-full bg-white/50" />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
