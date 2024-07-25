"use client";
import { Spinner } from "@/components/ui";
import { useSessions } from "@/context";
import { useEffect } from "react";

export default function Home() {
  const { createSession } = useSessions();
  useEffect(() => {
    createSession({
      redirect: true,
    });
  }, []);
  return (
    <main className="flex flex-col gap-2 h-[100dvh] w-screen items-center justify-center">
      <Spinner />
    </main>
  );
}
