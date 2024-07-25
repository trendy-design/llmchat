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
        "w-full px-3 py-2 bg-zinc-50 dark:bg-white/5 rounded-2xl min-h-12",
        className
      )}
    >
      {children}
    </div>
  );
};
