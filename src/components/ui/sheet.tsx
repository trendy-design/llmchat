import { cn } from "@/lib/utils";
import React from "react";
import { Drawer } from "vaul";

export type TSheetContent = {
  children: React.ReactNode;
  width?: "sm" | "md";
};

export const SheetContent = ({ children, width = "md" }: TSheetContent) => {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 bg-zinc-500/70 backdrop-blur-sm z-30" />
      <Drawer.Content
        className={cn(
          "flex flex-col rounded-3xl outline-none max-h-[80%] mt-24 fixed z-40 md:bottom-4 mx-auto md:left-[50%] left-0 bottom-0 right-0",
          width == "md" && `md:ml-[-250px] md:w-[500px] w-full`,
          width == "sm" && `md:ml-[-200px] md:w-[400px] w-full`
        )}
      >
        <div className="p-4 bg-white rounded-3xl flex-1">
          <div className="-col mx-auto w-8 h-1 flex-shrink-0 rounded-full bg-zinc-400 mb-4" />
          <div className="flex flex-col gap-4">{children}</div>
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  );
};

export const Sheet = React.forwardRef<
  React.ElementRef<typeof Drawer.Root>,
  React.ComponentPropsWithoutRef<typeof Drawer.Root>
>(({ ...props }, ref) => <Drawer.Root shouldScaleBackground {...props} />);

export const SheetTrigger = React.forwardRef<
  React.ElementRef<typeof Drawer.Trigger>,
  React.ComponentPropsWithoutRef<typeof Drawer.Trigger>
>(({ ...props }, ref) => (
  <Drawer.Trigger {...props} ref={ref} className="text-left" />
));

SheetTrigger.displayName = "SheetTrigger";
Sheet.displayName = "Sheet";
