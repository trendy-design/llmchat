import { useConfirm } from "@/context/confirm/provider";
import { useSessionsContext } from "@/context/sessions/provider";
import { TChatSession } from "@/hooks/use-chat-session";
import { useModelList } from "@/hooks/use-model-list";
import { cn } from "@/lib/utils";
import { PencilSimple, TrashSimple } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BotAvatar } from "../ui/bot-avatar";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tooltip } from "../ui/tooltip";

export const HistoryItem = ({
  session,
  dismiss,
}: {
  session: TChatSession;
  dismiss: () => void;
}) => {
  const {
    currentSession,
    updateSessionMutation,
    removeSessionByIdMutation,
    createSession,
  } = useSessionsContext();
  const { getModelByKey } = useModelList();
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

  const { open: openConfirm, dismiss: dismissConfirm } = useConfirm();

  return (
    <div
      key={session.id}
      className={cn(
        "gap-2 group w-full h-10 cursor-pointer flex flex-row items-center p-2 rounded-xl hover:bg-black/10 hover:dark:bg-black/30",
        currentSession?.id === session.id || isEditing
          ? "bg-black/10 dark:bg-black/30"
          : ""
      )}
      onClick={() => {
        if (!isEditing) {
          router.push(`/chat/${session.id}`);
          dismiss();
        }
      }}
    >
      {isEditing ? (
        <Input
          variant="ghost"
          className="h-6"
          ref={historyInputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
              updateSessionMutation.mutate({
                sessionId: session.id,
                session: {
                  title: title?.trim() || session?.title || "Untitled",
                },
              });
            }
          }}
          onBlur={() => {
            setIsEditing(false);
            updateSessionMutation.mutate({
              sessionId: session.id,
              session: { title: title?.trim() || session?.title || "Untitled" },
            });
          }}
        />
      ) : (
        <>
          {session.bot ? (
            <BotAvatar
              size="small"
              name={session?.bot?.name}
              avatar={session?.bot?.avatar}
            />
          ) : (
            getModelByKey(session.messages?.[0]?.model)?.icon("sm")
          )}
          <span className="w-full truncate text-xs md:text-sm">
            {session.title}
          </span>
        </>
      )}
      {(!isEditing || openDeleteConfirm) && (
        <Flex
          className={cn("group-hover:flex hidden", openDeleteConfirm && "flex")}
        >
          <Button
            variant="ghost"
            size="iconXS"
            onClick={(e) => {
              setIsEditing(true);
              e.stopPropagation();
            }}
          >
            <PencilSimple size={14} weight="bold" />
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
                  onClick={(e) => {
                    setOpenDeleteConfirm(true);
                    e.stopPropagation();
                  }}
                >
                  <TrashSimple size={14} weight="bold" />
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
                    onClick={(e) => {
                      removeSessionByIdMutation.mutate(session.id, {
                        onSuccess: () => {
                          dismissConfirm();
                          createSession({
                            redirect: true,
                          });
                        },
                      });
                      e.stopPropagation();
                    }}
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
