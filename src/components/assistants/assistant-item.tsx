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
import { defaultPreferences } from "@/config";
import { useModelList } from "@/hooks/use-model-list";
import { formatNumber } from "@/lib/helper";
import { TAssistant } from "@/types";
import { PuzzleIcon, ViewIcon } from "@hugeicons/react";
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
  const { getAssistantByKey, getAssistantIcon } = useModelList();
  const assistantProps = getAssistantByKey(assistant.key);
  const model = assistantProps?.model;
  const [open, setOpen] = useState(false);

  return (
    <CommandItem
      value={assistant.name}
      className="w-full"
      onSelect={() => {
        updatePreferences(
          {
            defaultAssistant: assistant.key,
            maxTokens: defaultPreferences.maxTokens,
          },
          () => {
            onSelect(assistant);
          }
        );
      }}
    >
      <Flex gap="sm" items="center" key={assistant.key} className="w-full">
        {getAssistantIcon(assistant.key, "sm")}
        {assistant.name} {model?.isNew && <Badge>New</Badge>}
        <div className="flex flex-1"></div>
        <Flex gap="md" items="center">
          {!!model?.vision && (
            <ViewIcon size={16} strokeWidth={1.5} className="text-zinc-500" />
          )}
          {!!model?.plugins?.length && (
            <PuzzleIcon size={16} strokeWidth={1.5} className="text-zinc-500" />
          )}
          {model?.tokens && (
            <Type size="xs" textColor="secondary">
              {formatNumber(model?.tokens)}
            </Type>
          )}
        </Flex>
        {assistant.type === "custom" && (
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
              asChild
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Button
                variant="ghost"
                size="iconSm"
                onClick={(e) => {
                  setOpen(true);
                }}
              >
                <DotsThree size={20} weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-[200px] text-sm md:text-base z-[800]"
              align="end"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  onEdit(assistant);

                  e.stopPropagation();
                }}
              >
                <Pencil size={14} weight="bold" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  onDelete(assistant);
                  e.stopPropagation();
                }}
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
