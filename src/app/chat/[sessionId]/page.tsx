"use client";
import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/chat-messages";
import { ModelSelect } from "@/components/model-select";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/settings/context";
import { DotsThree } from "@phosphor-icons/react";

const ChatSessionPage = () => {
  const { open } = useSettings();

  return (
    <div className="w-full h-screen flex flex-row relative overflow-hidden">
      <div className="absolute flex justify-between items-center p-2 flex-row top-0 left-0 right-0 bg-gradient-to-b dark:from-zinc-800 dark:to-transparent from-70% to-white/10 z-10">
        <p className="p-2 text-sm text-zinc-500">AIChat</p>
        <div className="flex flex-row gap-2 items-center">
          <ModelSelect />
          <Avatar name="Deep" />
          <Button variant="secondary" size="icon" onClick={open}>
            <DotsThree size={20} weight="bold" />
          </Button>
        </div>
      </div>
      <ChatMessages />
      <ChatInput />
    </div>
  );
};

export default ChatSessionPage;
