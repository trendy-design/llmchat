"use client";
import { BotAvatar } from "@/components/ui/bot-avatar";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/components/ui/use-toast";
import { useChatSession } from "@/hooks/use-chat-session";
import { useModelList } from "@/hooks/use-model-list";
import { cn } from "@/lib/utils";
import { Moon, Plus, Sun, TrashSimple } from "@phosphor-icons/react";
import moment from "moment";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useChatContext } from "../chat/context";
import { FiltersContext } from "./context";

export type TFiltersProvider = {
  children: React.ReactNode;
};
export const FiltersProvider = ({ children }: TFiltersProvider) => {
  const {
    sessions,
    createSession,
    clearChatSessions,
    removeSession,
    currentSession,
    refetchSessions,
  } = useChatContext();
  const { toast, dismiss } = useToast();
  const { sortSessions } = useChatSession();
  const router = useRouter();
  const { getModelByKey } = useModelList();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const open = () => {
    refetchSessions();
    setIsFilterOpen(true);
  };

  const onClose = () => setIsFilterOpen(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsFilterOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const actions = [
    {
      name: "New session",
      icon: Plus,
      action: () => {
        createSession({
          redirect: true,
        });
        onClose();
      },
    },
    {
      name: `Switch to ${theme === "light" ? "dark" : "light"} mode`,
      icon: theme === "light" ? Moon : Sun,
      action: () => {
        setTheme(theme === "light" ? "dark" : "light");
        onClose();
      },
    },
    {
      name: "Delete current session",
      icon: TrashSimple,
      action: () => {
        onClose();
        toast({
          title: "Delete Session?",
          description: "This action cannot be undone.",
          variant: "destructive",
          action: (
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                currentSession?.id &&
                  removeSession(currentSession?.id).then(() => {
                    createSession({
                      redirect: true,
                    });
                    dismiss();
                  });
              }}
            >
              Delete
            </Button>
          ),
        });
      },
    },
  ];

  return (
    <FiltersContext.Provider value={{ open, dismiss: onClose }}>
      {children}

      <CommandDialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <CommandInput placeholder="Search..." />

        <CommandList className="border-t border-zinc-500/20">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            {actions.map((action) => (
              <CommandItem
                key={action.name}
                className="gap-2"
                value={action.name}
                onSelect={action.action}
              >
                <div className="w-6 h-6 items-center justify-center flex">
                  <action.icon
                    size={16}
                    weight="bold"
                    className="flex-shrink-0"
                  />
                </div>
                {action.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Recent Conversations">
            {sortSessions(sessions, "updatedAt")?.map((session) => (
              <CommandItem
                key={session.id}
                value={`${session.id}/${session.title}`}
                className={cn(
                  "gap-2 w-full",
                  currentSession?.id === session.id
                    ? "bg-black/10 dark:bg-black/10"
                    : ""
                )}
                onSelect={(value) => {
                  router.push(`/chat/${session.id}`);
                  onClose();
                }}
              >
                {session.bot ? (
                  <BotAvatar
                    size="small"
                    name={session?.bot?.name}
                    avatar={session?.bot?.avatar}
                  />
                ) : (
                  getModelByKey(session.messages?.[0]?.model)?.icon()
                )}
                <span className="w-full truncate">{session.title}</span>
                <span className="pl-4 text-xs md:text-xs  text-zinc-400 dark:text-zinc-700 flex-shrink-0">
                  {moment(session.createdAt).fromNow(true)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </FiltersContext.Provider>
  );
};
