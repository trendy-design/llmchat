"use client";
import { Toaster } from "@/components/ui/toaster";

export type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="w-full h-[100dvh] bg-zinc-100 dark:bg-zinc-950 flex flex-row ">
      {children}
      <Toaster />
    </div>
  );
};
