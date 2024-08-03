import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommandItem } from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flex } from "@/components/ui/flex";
import { PuzzleIcon, ViewIcon } from "@/components/ui/icons";
import { defaultPreferences } from "@/config";
import { formatNumber } from "@/helper/utils";
import { useAssistantUtils } from "@/hooks/use-assistant-utils";
import { TAssistant } from "@/types";
import { DotsThree, Pencil, TrashSimple } from "@phosphor-icons/react";
import { useState } from "react";
import { usePreferenceContext } from "../../context/preferences";
import { Type } from "../ui";

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
              <ViewIcon size={16} strokeWidth={1.5} className="text-zinc-500" />
            )}
            {!!model?.plugins?.length && (
              <PuzzleIcon
                size={16}
                strokeWidth={1.5}
                className="text-zinc-500"
              />
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
                <DotsThree size={20} weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="z-[800] min-w-[200px] text-sm md:text-base"
              align="end"
            >
              <DropdownMenuItem
                onClick={handleDropdownItemSelect(() => onEdit(assistant))}
              >
                <Pencil size={14} weight="bold" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDropdownItemSelect(() => onDelete(assistant))}
              >
                <TrashSimple size={14} weight="bold" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Flex>
    </CommandItem>
  );
};
