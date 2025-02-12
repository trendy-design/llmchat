import {
        Button,
        ButtonProps,
        Popover,
        PopoverContent,
        PopoverTrigger,
} from "@repo/ui";
import { FC, ReactNode } from "react";

type ConfirmPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonProps["variant"];
  cancelVariant?: ButtonProps["variant"];
  children: ReactNode;
  additionalActions?: ReactNode;
};

export const ConfirmPopover: FC<ConfirmPopoverProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  confirmText = "Delete",
  cancelText = "Cancel",
  confirmVariant = "destructive",
  cancelVariant = "ghost",
  children,
  additionalActions,
}) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent>
        <p className="text-sm md:text-base font-medium pb-2">{title}</p>
        <div className="flex flex-row gap-1">
          <Button
            variant={confirmVariant}
            onClick={(e) => {
              onConfirm();
              e.stopPropagation();
            }}
          >
            {confirmText}
          </Button>
          <Button
            variant={cancelVariant}
            onClick={(e) => {
              onOpenChange(false);
              e.stopPropagation();
            }}
          >
            {cancelText}
          </Button>
          {additionalActions}
        </div>
      </PopoverContent>
    </Popover>
  );
};
