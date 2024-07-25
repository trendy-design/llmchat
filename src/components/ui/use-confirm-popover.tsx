import { HugeiconsProps } from "@hugeicons/react";
import { FC, RefAttributes, useState } from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export type TPopoverConfirm = {
  title: string;
  onConfirm: (dismiss: () => void) => void;
  confimBtnText?: string;
  confimBtnVariant?: "destructive" | "default";
  confirmIcon?: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>;
  onCancel?: () => void;
  children: React.ReactNode;
};
export const PopOverConfirmProvider = ({
  title,
  onConfirm,
  confirmIcon,
  confimBtnVariant,
  confimBtnText = "Confirm",
  onCancel,
  children,
}: TPopoverConfirm) => {
  const [openConfirm, setOpenConfirm] = useState(false);

  const Icon = confirmIcon;
  return (
    <Popover open={openConfirm} onOpenChange={setOpenConfirm}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="z-[1000]" side="bottom">
        <p className="pb-2 text-sm font-medium md:text-base">{title}</p>
        <div className="flex flex-row gap-1">
          <Button
            variant={confimBtnVariant}
            size="sm"
            onClick={(e) => {
              onConfirm(() => setOpenConfirm(false));
              e.stopPropagation();
            }}
          >
            {Icon && <Icon size={16} strokeWidth={2} />}

            {confimBtnText}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              onCancel?.();
              setOpenConfirm(false);
              e.stopPropagation();
            }}
          >
            Cancel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
