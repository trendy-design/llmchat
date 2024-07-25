"use client";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "./sidebar";

export type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="w-full h-[100dvh] bg-zinc-100 dark:bg-zinc-800 flex flex-row ">
      <Sidebar />
      {children}
      <Toaster />
    </div>
  );
};
