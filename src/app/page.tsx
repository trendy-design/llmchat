"use client";
import { Type } from "@/components/ui";

export default function Home() {
  return (
    <main className="flex h-[100dvh] w-screen flex-col items-center justify-center gap-2">
      <Type className="text-center !text-[6rem] font-semibold leading-tight tracking-tighter">
        Your Ultimate
        <br />
        Al Copilot
      </Type>
    </main>
  );
}
