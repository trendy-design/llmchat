"use client";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "./sidebar";

export type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-[100dvh] w-full flex-col justify-start bg-zinc-100 dark:bg-zinc-800 md:flex-row">
      <Sidebar />
      {children}
      <Toaster />
    </div>
  );
};
