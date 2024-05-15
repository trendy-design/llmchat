"use client";
import Spinner from "@/components/ui/loading-spinner";
import { useChatContext } from "@/context/chat/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { createSession } = useChatContext();
  useEffect(() => {
    createSession().then((session) => {
      router.push(`/chat/${session.id}`);
    });
  }, []);
  return (
    <main className="flex flex-row h-screen w-screen items-center justify-center">
      <Spinner />
    </main>
  );
}
