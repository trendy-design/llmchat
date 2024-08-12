"use client";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "./navbar";

export type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="bg-zinc-25 flex min-h-[100dvh] w-full flex-col justify-start dark:bg-zinc-800 md:flex-row">
      <Navbar />
      {children}
      <Toaster />
    </div>
  );
};
