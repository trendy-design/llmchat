import { cn } from "@/lib/utils";

export type TAvatar = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};
export const Avatar = ({ name, size = "md", className }: TAvatar) => {
  const sizes = {
    sm: 28,
    md: 32,
    lg: 48,
  };

  return (
    <div
      className={cn(
        "rounded-full relative text-zinc-900/70 dark:text-white dark:bg-white/10 bg-black/10",
        size === "sm" && "min-w-7 h-7",
        size === "md" && "min-w-8 h-8",
        size === "lg" && "min-w-12 h-12",
        className
      )}
    >
      <p className=" font-bold uppercase absolute inset-0 flex items-center justify-center">
        {name?.[0]}
      </p>
    </div>
  );
};
