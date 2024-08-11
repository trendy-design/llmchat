"use client";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { Sidebar } from "./sidebar";

export type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout = ({ children }: MainLayoutProps) => {
  useEffect(() => {
    setTimeout(() => {
      throw new Error("Test error");
    }, 10000);
  }, []);
  return (
    <div className="bg-zinc-25 flex min-h-[100dvh] w-full flex-col justify-start dark:bg-zinc-800 md:flex-row">
      <Sidebar />
      {children}
      <Toaster />
    </div>
  );
};
