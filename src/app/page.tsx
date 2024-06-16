"use client";
import { ModelIcon } from "@/components/icons/model-icon";
import Spinner from "@/components/ui/loading-spinner";
import { useSessionsContext } from "@/context/sessions/provider";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { createSession } = useSessionsContext();
  // useEffect(() => {
  //   createSession({
  //     redirect: true,
  //   });
  // }, []);
  return (
    <main className="flex flex-col gap-2 h-[100dvh] w-screen items-center justify-center">
      <ModelIcon type="aichat" size="sm" />
      <Spinner />
    </main>
  );
}
