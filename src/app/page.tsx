"use client";
import { ModelIcon } from "@/components/icons/model-icon";
import Spinner from "@/components/ui/loading-spinner";
import { useChatContext } from "@/context/chat/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { createSession } = useChatContext();
  useEffect(() => {
    createSession({
      redirect: true,
    });
  }, []);
  return (
    <main className="flex flex-col gap-2 h-[100dvh] w-screen items-center justify-center">
      <ModelIcon type="aichat" size="lg" />
      <Spinner />
    </main>
  );
}
