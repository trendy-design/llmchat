import { cn } from "@/helper/clsx";
import { ReactNode } from "react";

export type TSettingCard = {
  children: ReactNode;
  className?: string;
};
export const SettingCard = ({ children, className }: TSettingCard) => {
  return (
    <div
      className={cn(
        "min-h-12 w-full rounded-lg bg-zinc-50 px-3 py-1 dark:bg-white/5",
        className,
      )}
    >
      {children}
    </div>
  );
};
