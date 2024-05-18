"use client";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout = ({ children }: MainLayoutProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "w-full h-screen flex flex-row",
        theme === "light" ? "light" : "dark"
      )}
    >
      <div className="w-full h-screen flex flex-row bg-zinc-50 dark:bg-zinc-800">
        {children}
        <Toaster />
      </div>
    </div>
  );
};
