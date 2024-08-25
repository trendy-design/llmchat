"use client";
import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  useToast,
} from "@/ui";
import moment from "moment";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "../utils/clsx";
import { sortSessions } from "../utils/utils";

import { Moon, Plus, Sun, Trash } from "lucide-react";
import { createContext, useContext } from "react";
import { useSessions } from "./sessions";

export type TCommandContext = {
  open: () => void;
  dismiss: () => void;
};
export const CommandsContext = createContext<undefined | TCommandContext>(
  undefined,
);

export const useCommandContext = () => {
  const context = useContext(CommandsContext);
  if (context === undefined) {
    throw new Error("useCommands must be used within a CommandsProvider");
  }
  return context;
};

export type TCommandsProvider = {
  children: React.ReactNode;
};
export const CommandsProvider = ({ children }: TCommandsProvider) => {
  const { sessions, createSession, refetchSessions, setActiveSessionId } =
    useSessions();
  const { toast } = useToast();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const open = () => {
    refetchSessions?.();
    setIsCommandOpen(true);
  };

  const onClose = () => setIsCommandOpen(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
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
        createSession();
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
      icon: Trash,
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
                // currentSession?.id &&
                //   removeSessionMutation.mutate(currentSession?.id, {
                //     onSuccess() {
                //       createSession({
                //         redirect: true,
                //       });
                //       dismiss();
                //     },
                //   });
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
    <CommandsContext.Provider value={{ open, dismiss: onClose }}>
      {children}

      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput placeholder="Search..." />

        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {actions.map((action) => (
              <CommandItem
                key={action.name}
                className="gap-2"
                value={action.name}
                onSelect={action.action}
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  <action.icon
                    size={16}
                    strokeWidth="2"
                    className="flex-shrink-0"
                  />
                </div>
                {action.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Recent Conversations">
            {sortSessions(sessions, "updatedAt")?.map((session) => {
              return (
                <CommandItem
                  key={session.id}
                  value={`${session.id}/${session.title}`}
                  className={cn("w-full gap-2")}
                  onSelect={(value) => {
                    setActiveSessionId(session.id);
                    onClose();
                  }}
                >
                  <span className="w-full truncate">{session.title}</span>
                  <span className="flex-shrink-0 pl-4 text-xs text-zinc-400 dark:text-zinc-700 md:text-xs">
                    {moment(session.createdAt).fromNow(true)}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CommandsContext.Provider>
  );
};
