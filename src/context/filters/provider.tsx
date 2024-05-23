"use client";
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
import { Eraser, Moon, Plus, Sun, TrashSimple } from "@phosphor-icons/react";
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
  } = useChatContext();
  const { toast } = useToast();
  const { sortSessions } = useChatSession();
  const router = useRouter();
  const { getModelByKey } = useModelList();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const open = () => setIsFilterOpen(true);

  const dismiss = () => setIsFilterOpen(false);

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

  return (
    <FiltersContext.Provider value={{ open, dismiss }}>
      {children}

      <CommandDialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem
              className={cn("gap-3")}
              value="new"
              onSelect={(value) => {
                createSession().then((session) => {
                  router.push(`/chat/${session.id}`);
                  dismiss();
                });
              }}
            >
              <Plus size={16} weight="bold" className="flex-shrink-0" />
              New session
            </CommandItem>
            <CommandItem
              className="gap-3"
              value="theme"
              onSelect={(value) => {
                setTheme(theme === "light" ? "dark" : "light");
                dismiss();
              }}
            >
              {theme === "light" ? (
                <Moon size={16} weight="bold" className="flex-shrink-0" />
              ) : (
                <Sun size={16} weight="bold" className="flex-shrink-0" />
              )}
              Switch to {theme === "light" ? "dark" : "light"} mode
            </CommandItem>
            <CommandItem
              className="gap-3"
              value="delete"
              onSelect={(value) => {
                currentSession?.id &&
                  removeSession(currentSession?.id).then(() => {
                    createSession().then((session) => {
                      router.push(`/chat/${session.id}`);

                      dismiss();
                    });
                  });
              }}
            >
              <TrashSimple size={16} weight="bold" className="flex-shrink-0" />
              Delete current session
            </CommandItem>
            <CommandItem
              className="gap-3"
              value="clear history"
              onSelect={(value) => {
                dismiss();
                toast({
                  title: "Are you sure?",
                  description:
                    "This will clear all chat history. This action cannot be undone.",
                  variant: "destructive",
                  action: (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        clearChatSessions().then(() => {
                          createSession().then((session) => {
                            router.push(`/chat/${session?.id}`);
                            dismiss();
                          });
                        });
                      }}
                    >
                      Delete
                    </Button>
                  ),
                });
              }}
            >
              <Eraser size={16} weight="bold" className="flex-shrink-0" />
              Clear History
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Sessions">
            {sortSessions(sessions, "updatedAt")?.map((session) => (
              <CommandItem
                key={session.id}
                value={`${session.id}/${session.title}`}
                className={cn(
                  "gap-3 w-full",
                  currentSession?.id === session.id
                    ? "bg-black/10 dark:bg-black/10"
                    : ""
                )}
                onSelect={(value) => {
                  router.push(`/chat/${session.id}`);
                  dismiss();
                }}
              >
                {getModelByKey(session.messages?.[0]?.model)?.icon()}
                <span className="w-full truncate">{session.title}</span>
                <span className="pl-4 text-xs  text-zinc-400 dark:text-zinc-700 flex-shrink-0">
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
