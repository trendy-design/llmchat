import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Type } from "@/components/ui/text";
import { Tooltip } from "@/components/ui/tooltip";
import { useSessions } from "@/context";
import { cn } from "@/helper/clsx";
import { TChatSession } from "@/types";
import { Delete01Icon, Edit02Icon } from "@hugeicons/react";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const HistoryItem = ({
  session,
  dismiss,
}: {
  session: TChatSession;
  dismiss: () => void;
}) => {
  const { sessionId } = useParams();
  const {
    updateSessionMutation,
    removeSessionMutation,
    refetchSessions,
    createSession,
  } = useSessions();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(session.title);
  const router = useRouter();
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
      router.push(`/chat/${session.id}`);
      dismiss();
    }
  };

  const containerClasses = cn(
    "gap-2 group w-full cursor-pointer flex flex-row items-start py-2 pl-3 pr-2 rounded-xl hover:bg-black/10 hover:dark:bg-black/30",
    sessionId?.toString() === session.id || isEditing
      ? "bg-black/10 dark:bg-black/30"
      : ""
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
        if (sessionId === session.id) {
          createSession({
            redirect: true,
          });
        }
        refetchSessions?.();
      },
    });
    e.stopPropagation();
  };

  return (
    <div key={session.id} className={containerClasses} onClick={handleOnClick}>
      {isEditing ? (
        <Input
          variant="ghost"
          className="h-6 text-sm"
          ref={historyInputRef}
          value={title}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
        />
      ) : (
        <>
          <Flex direction="col" items="start" className="w-full" gap="none">
            <Type
              className="line-clamp-1"
              size="sm"
              textColor="primary"
              weight="medium"
            >
              {session.title}
            </Type>
            <Type className="line-clamp-1" size="xs" textColor="tertiary">
              {moment(session.updatedAt).fromNow()}
            </Type>
          </Flex>
        </>
      )}
      {(!isEditing || openDeleteConfirm) && (
        <Flex
          className={cn("group-hover:flex hidden", openDeleteConfirm && "flex")}
        >
          <Button variant="ghost" size="iconXS" onClick={handleEditClick}>
            <Edit02Icon size={14} variant="stroke" strokeWidth="2" />
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
                  onClick={handleDeleteClick}
                >
                  <Delete01Icon size={14} variant="stroke" strokeWidth="2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="z-[1000]" side="bottom">
                <p className="text-sm md:text-base font-medium pb-2">
                  Are you sure you want to delete this message?
                </p>
                <div className="flex flex-row gap-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteConfirm}
                  >
                    Delete Message
                  </Button>
                  <Button
                    variant="ghost"
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
