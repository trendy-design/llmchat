import { defaultPreferences } from "@/config";
import { usePreferenceContext } from "@/lib/context";
import { useAssistantUtils } from "@/lib/hooks";
import { TAssistant } from "@/lib/types";
import { formatNumber } from "@/lib/utils/utils";
import {
  Badge,
  Button,
  CommandItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Type,
} from "@/ui";
import { Ellipsis, Eye, Pencil, ToyBrick, Trash } from "lucide-react";
import { useState } from "react";

export type TAssistantItem = {
  assistant: TAssistant;
  onSelect: (assistant: TAssistant) => void;
  onDelete: (assistant: TAssistant) => void;
  onEdit: (assistant: TAssistant) => void;
};

export const AssistantItem = ({
  assistant,
  onSelect,
  onDelete,
  onEdit,
}: TAssistantItem) => {
  const { updatePreferences } = usePreferenceContext();
  const { getAssistantByKey, getAssistantIcon } = useAssistantUtils();
  const assistantProps = getAssistantByKey(assistant.key);
  const model = assistantProps?.model;
  const [open, setOpen] = useState(false);

  const handleSelect = () => {
    updatePreferences(
      {
        defaultAssistant: assistant.key,
        maxTokens: defaultPreferences.maxTokens,
      },
      () => onSelect(assistant),
    );
  };

  const handleDropdownItemSelect =
    (action: () => void) => (e: React.MouseEvent<HTMLDivElement>) => {
      action();
      e.stopPropagation();
    };

  return (
    <CommandItem
      value={assistant.name}
      className="w-full"
      onSelect={handleSelect}
    >
      <Flex gap="sm" items="center" key={assistant.key} className="w-full">
        {getAssistantIcon(assistant.key, "sm")}
        {assistant.name}
        {model?.isNew && assistant.type !== "custom" && <Badge>New</Badge>}
        {model?.isFree && assistant.type !== "custom" && <Badge>Free</Badge>}
        {model?.isSignUpRequired && assistant.type !== "custom" && (
          <Badge variant="secondary">Login Required</Badge>
        )}
        <div className="flex flex-1"></div>
        {assistant.type !== "custom" && (
          <Flex gap="md" items="center">
            {!!model?.vision && (
              <Eye size={16} strokeWidth={1.5} className="text-zinc-500" />
            )}
            {!!model?.plugins?.length && (
              <ToyBrick size={16} strokeWidth={1.5} className="text-zinc-500" />
            )}
            {model?.tokens && (
              <Type size="xs" textColor="secondary">
                {formatNumber(model?.tokens)}
              </Type>
            )}
          </Flex>
        )}
        {assistant.type === "custom" && (
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
              asChild
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
              }}
            >
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => setOpen(true)}
              >
                <Ellipsis size={16} strokeWidth={2} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="z-[800] min-w-[200px] text-sm md:text-base"
              align="end"
            >
              <DropdownMenuItem
                onClick={handleDropdownItemSelect(() => onEdit(assistant))}
              >
                <Pencil size={14} strokeWidth={2} />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDropdownItemSelect(() => onDelete(assistant))}
              >
                <Trash size={14} strokeWidth={2} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Flex>
    </CommandItem>
  );
};
