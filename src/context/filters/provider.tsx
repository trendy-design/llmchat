"use client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useChatSession } from "@/hooks/use-chat-session";
import { Chat, Eraser, Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useChatContext } from "../chat/context";
import { FiltersContext } from "./context";

export type TFiltersProvider = {
  children: React.ReactNode;
};
export const FiltersProvider = ({ children }: TFiltersProvider) => {
  const { sessions, createSession, clearChatSessions } = useChatContext();
  const { sortSessions } = useChatSession();
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
              className="gap-3"
              value="new"
              onSelect={(value) => {
                createSession().then((session) => {
                  router.push(`/chat/${session.id}`);
                  dismiss();
                });
              }}
            >
              <Plus size={14} weight="bold" />
              New session
            </CommandItem>
            <CommandItem
              className="gap-3"
              value="clear history"
              onSelect={(value) => {
                clearChatSessions().then(() => {
                  createSession().then((session) => {
                    router.push(`/chat/${session?.id}`);
                    dismiss();
                  });
                });
              }}
            >
              <Eraser size={14} weight="bold" />
              Clear History
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Sessions">
            {sortSessions(sessions, "updatedAt")?.map((session) => (
              <CommandItem
                key={session.id}
                value={`${session.id}/${session.title}`}
                className="gap-3 w-full"
                onSelect={(value) => {
                  router.push(`/chat/${session.id}`);
                  dismiss();
                }}
              >
                <Chat
                  size={14}
                  weight="fill"
                  className="text-zinc-500 flex-shrink-0"
                />{" "}
                <span className="w-full truncate">{session.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </FiltersContext.Provider>
  );
};
