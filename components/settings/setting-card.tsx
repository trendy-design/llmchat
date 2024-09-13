import { cn } from "@/lib/utils/clsx";
import { ReactNode } from "react";

export type TSettingCard = {
  children: ReactNode;
  className?: string;
};
export const SettingCard = ({ children, className }: TSettingCard) => {
  return (
    <div
      className={cn(
        "min-h-12 w-full rounded-lg bg-zinc-500/10 px-3 py-1",
        className,
      )}
    >
      {children}
    </div>
  );
};
