"use client";
import { useTheme } from "next-themes";
import { Toaster } from "./ui/toaster";

export type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout = ({ children }: MainLayoutProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-full h-screen flex flex-row bg-zinc-white dark:bg-zinc-800">
      {children}
      <Toaster />
    </div>
  );
};
