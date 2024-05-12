"use client";
import { useChatContext } from "@/context/chat/context";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export const Sidebar = () => {
  const { sessions, createSession } = useChatContext();
  const { push } = useRouter();
  return (
    <div className="w-[250px] flex flex-col h-screen">
      <Button
        onClick={() => {
          createSession();
        }}
      >
        New Session
      </Button>
      {sessions?.map((session) => (
        <div
          className="p-2"
          onClick={() => {
            push(`/chat/${session.id}`);
          }}
        >
          {session?.title}
        </div>
      )) || "No sessions found"}
    </div>
  );
};
