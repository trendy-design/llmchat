"use client";
import { useTheme } from "next-themes";
import { Toaster } from "./ui/toaster";

export type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout = ({ children }: MainLayoutProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-full h-[100dvh] bg-zinc-100 dark:bg-zinc-950 p-1 flex flex-row ">
      {children}
      <Toaster />
    </div>
  );
};
