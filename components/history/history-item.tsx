import { useSessions } from "@/lib/context";
import { TChatSession } from "@/lib/types";
import { cn } from "@/lib/utils/clsx";
import {
  Button,
  Flex,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  Type,
} from "@/ui";
import { Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const HistoryItem = ({
  session,
  dismiss,
}: {
  session: TChatSession;
  dismiss: () => void;
}) => {
  const {
    updateSessionMutation,
    removeSessionMutation,
    refetchSessions,
    createSession,
    setActiveSessionId,
    activeSessionId,
  } = useSessions();
  const { push } = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(session.title);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const historyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      historyInputRef.current?.focus();
    }
  }, [isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      updateSessionMutation.mutate({
        sessionId: session.id,
        session: {
          title: title?.trim() || session?.title || "Untitled",
        },
      });
    }
  };

  const handleOnClick = () => {
    if (!isEditing) {
      push("/chat");
      setActiveSessionId(session.id);
      dismiss();
    }
  };

  const containerClasses = cn(
    "gap-2 w-full group w-full cursor-pointer flex flex-row items-center h-10 py-1 pl-2.5 pr-1.5 rounded-lg hover:bg-zinc-500/10",
    activeSessionId === session.id || isEditing ? "bg-zinc-500/10" : "",
  );

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsEditing(true);
    e.stopPropagation();
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpenDeleteConfirm(true);
    e.stopPropagation();
  };

  const handleDeleteConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    removeSessionMutation.mutate(session.id, {
      onSuccess: () => {
        if (activeSessionId === session.id) {
          createSession();
        }
        refetchSessions?.();
        setOpenDeleteConfirm(false);
      },
    });
    e.stopPropagation();
  };

  return (
    <div key={session.id} className={containerClasses} onClick={handleOnClick}>
      {isEditing ? (
        <Input
          variant="ghost"
          className="h-6 pl-0 text-sm"
          ref={historyInputRef}
          value={title || "Untitled"}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
        />
      ) : (
        <>
          <Flex direction="col" items="start" className="w-full" gap="none">
            <Type className="line-clamp-1" size="sm" textColor="primary">
              {session.title}
            </Type>
            {/* <Type className="line-clamp-1" size="xs" textColor="tertiary">
              {moment(session.updatedAt).fromNow()}
            </Type> */}
          </Flex>
        </>
      )}
      {(!isEditing || openDeleteConfirm) && (
        <Flex
          className={cn("hidden group-hover:flex", openDeleteConfirm && "flex")}
        >
          <Button variant="ghost" size="iconXS" onClick={handleEditClick}>
            <Pencil size={14} strokeWidth="2" />
          </Button>
          <Tooltip content="Delete">
            <Popover
              open={openDeleteConfirm}
              onOpenChange={setOpenDeleteConfirm}
            >
              <PopoverTrigger asChild>
                <Button
                  variant={openDeleteConfirm ? "secondary" : "ghost"}
                  size="iconXS"
                  onClick={(e) => handleDeleteClick(e)}
                >
                  <Trash size={14} strokeWidth="2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="z-[1000]" side="bottom">
                <p className="pb-2 text-sm font-medium">
                  Are you sure you want to delete this session?
                </p>
                <div className="flex flex-row gap-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteConfirm}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      setOpenDeleteConfirm(false);
                      e.stopPropagation();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </Tooltip>
        </Flex>
      )}
    </div>
  );
};
