"use client";
import { useRootContext } from "@/libs/context/root";
import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  useToast,
} from "@/ui";
import { Moon, Plus, Sun, Trash } from "lucide-react";
import moment from "moment";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useSessions } from "../lib/context/sessions";
import { cn } from "../lib/utils/clsx";
import { sortSessions } from "../lib/utils/utils";

export const CommandSearch = () => {
  const { isCommandSearchOpen, setIsCommandSearchOpen } = useRootContext();
  const { sessions, createSession, refetchSessions, setActiveSessionId } =
    useSessions();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (isCommandSearchOpen) {
      refetchSessions?.();
    }
  }, [isCommandSearchOpen]);

  const onClose = () => setIsCommandSearchOpen(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandSearchOpen(true);
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
    <CommandDialog
      open={isCommandSearchOpen}
      onOpenChange={setIsCommandSearchOpen}
    >
      <CommandInput placeholder="Search..." />
      <CommandSeparator />

      <CommandList className="pt-1.5">
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
  );
};
