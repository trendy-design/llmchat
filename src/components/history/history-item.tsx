import { useSessionsContext } from "@/context/sessions/provider";
import { TChatSession } from "@/hooks/use-chat-session";
import { useModelList } from "@/hooks/use-model-list";
import { cn } from "@/lib/utils";
import { PencilSimple, TrashSimple } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BotAvatar } from "../ui/bot-avatar";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import { Input } from "../ui/input";

export const HistoryItem = ({
  session,
  dismiss,
}: {
  session: TChatSession;
  dismiss: () => void;
}) => {
  const { currentSession, updateSessionMutation } = useSessionsContext();
  const { getModelByKey } = useModelList();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(session.title);
  const router = useRouter();
  return (
    <div
      key={session.id}
      className={cn(
        "gap-2 group w-full h-10 cursor-pointer flex flex-row items-center p-2 rounded-xl hover:bg-black/10 hover:dark:bg-black/30",
        currentSession?.id === session.id ? "bg-black/10 dark:bg-black/30" : ""
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
              updateSessionMutation.mutate({
                sessionId: session.id,
                session: { title: title || session?.title || "Untitled" },
              });
            }
          }}
          onBlur={() => {
            setIsEditing(false);
            updateSessionMutation.mutate({
              sessionId: session.id,
              session: { title: title || session?.title || "Untitled" },
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
            getModelByKey(session.messages?.[0]?.model)?.icon()
          )}
          <span className="w-full truncate text-xs md:text-sm">
            {session.title}
          </span>
        </>
      )}
      {!isEditing && (
        <Flex className={"group-hover:flex hidden"}>
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
          <Button variant="ghost" size="iconXS">
            <TrashSimple size={14} weight="bold" />
          </Button>
        </Flex>
      )}
    </div>
  );
};
