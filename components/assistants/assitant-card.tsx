import { Button, Flex, PopOverConfirmProvider, Type } from "@/components/ui";
import { TCustomAssistant } from "@/types";
import { Plus, Trash as TrashIcon } from "lucide-react";
import React from "react";
import { CustomAssistantAvatar } from "../custom-assistant-avatar";
import { ModelIcon } from "../model-icon";

interface AssistantCardProps {
  assistant: TCustomAssistant;
  canDelete: boolean;
  onAddToChat: (assistant: TCustomAssistant) => void;
  onDelete: (key: string) => void;
}

export const AssistantCard: React.FC<AssistantCardProps> = ({
  assistant,
  canDelete,
  onAddToChat,
  onDelete,
}) => {
  return (
    <div className="group relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-4 pb-4 pt-6 hover:bg-zinc-50 dark:hover:bg-zinc-900">
      {assistant.iconURL ? (
        <CustomAssistantAvatar
          url={assistant.iconURL}
          alt={assistant.name}
          size="lg"
        />
      ) : (
        <ModelIcon type="assistants" size="lg" />
      )}
      <Flex direction="col" items="center" className="w-full">
        <Type weight="medium">{assistant.name}</Type>
        <Type textColor="secondary" className="line-clamp-2 w-full text-center">
          {assistant.description}
        </Type>
      </Flex>
      <Flex direction="col" items="center">
        <Button
          size="sm"
          variant="bordered"
          className="mt-2"
          onClick={() => onAddToChat(assistant)}
        >
          <Plus size={16} />
          Add to chat
        </Button>
        {canDelete && (
          <span className="absolute right-1.5 top-1.5">
            <PopOverConfirmProvider
              title="Are you sure you want to delete this assistant?"
              onConfirm={() => onDelete(assistant.key)}
              confimBtnText="Delete"
              confimBtnVariant="destructive"
            >
              <Button
                size="icon-xs"
                variant="ghost"
                className="opacity-50 group-hover:opacity-100"
              >
                <TrashIcon size={14} />
              </Button>
            </PopOverConfirmProvider>
          </span>
        )}
      </Flex>
    </div>
  );
};
