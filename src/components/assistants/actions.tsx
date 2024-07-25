import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TAssistant } from "@/types";
import { DotsThree, Pencil, TrashSimple } from "@phosphor-icons/react";
import { FC } from "react";

export type TAssistantActions = {
  assistant: TAssistant;
  onEdit: (assistant: TAssistant) => void;
  onDelete: (assistant: TAssistant) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

type TDropdownAction = {
  label: string;
  icon: JSX.Element;
  onClick: (assistant: TAssistant) => void;
};

export const AssistantActions: FC<TAssistantActions> = ({
  assistant,
  onEdit,
  onDelete,
  open,
  setOpen,
}) => {
  const actions: TDropdownAction[] = [
    {
      label: "Edit",
      icon: <Pencil size={14} weight="bold" />,
      onClick: (assistant: TAssistant) => onEdit(assistant),
    },
    {
      label: "Delete",
      icon: <TrashSimple size={14} weight="bold" />,
      onClick: (assistant: TAssistant) => onDelete(assistant),
    },
  ];

  return (
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
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={(e) => {
              action.onClick(assistant);
              e.stopPropagation();
            }}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
