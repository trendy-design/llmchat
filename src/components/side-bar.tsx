import { useChatContext } from "@/context/chat/context";
import { useChatSession } from "@/hooks/use-chat-session";
import { useModelList } from "@/hooks/use-model-list";
import { cn } from "@/lib/utils";
import { Plus, SidebarSimple } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Drawer } from "vaul";
import { Button } from "./ui/button";

export const HistorySidebar = () => {
  const {
    sessions,
    createSession,
    clearChatSessions,
    removeSession,
    currentSession,
  } = useChatContext();
  const { push } = useRouter();
  const [open, setOpen] = useState(false);
  const { sortSessions } = useChatSession();
  const router = useRouter();
  const { getModelByKey } = useModelList();

  return (
    <Drawer.Root direction="left" open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="ghost" size="iconSm">
          <SidebarSimple size={20} weight="bold" />
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[900] bg-zinc-500/70 dark:bg-zinc-900/70 backdrop-blur-sm" />
        <Drawer.Content
          className={cn(
            "flex flex-col rounded-3xl outline-none h-[98dvh] w-[280px] fixed z-[901] md:bottom-2 left-2 top-2 "
          )}
        >
          <div className="bg-white dark:bg-zinc-700 dark:border dark:border-white/5 flex flex-row rounded-2xl flex-1 p-2 relative">
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
                    createSession().then((session) => {
                      push(`/chat/${session.id}`);
                    });
                  }}
                >
                  <Plus size={20} weight="bold" />
                </Button>
              </div>
              <div className="p-2 mt-2">
                <p className="text-sm text-zinc-500">Recent History</p>
              </div>
              {sortSessions(sessions, "updatedAt")?.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "gap-2 w-full cursor-pointer flex flex-row items-center p-2 rounded-xl hover:bg-black/10 hover:dark:bg-black/30",
                    currentSession?.id === session.id
                      ? "bg-black/10 dark:bg-black/30"
                      : ""
                  )}
                  onClick={() => {
                    router.push(`/chat/${session.id}`);
                    setOpen(false);
                  }}
                >
                  {getModelByKey(session.messages?.[0]?.model)?.icon()}
                  <span className="w-full truncate text-xs md:text-sm">
                    {session.title}
                  </span>
                </div>
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
