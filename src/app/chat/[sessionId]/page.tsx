"use client";
import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/chat-messages";
import { ModelIcon } from "@/components/icons/model-icon";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/settings/context";
import { DotsThree } from "@phosphor-icons/react";

const ChatSessionPage = () => {
  const { open } = useSettings();

  return (
    <div className="w-full h-screen flex flex-row relative overflow-hidden">
      <div className="absolute flex justify-between items-center p-4 flex-row top-0 left-0 right-0 bg-gradient-to-b dark:from-zinc-800 dark:to-transparent from-70% to-white/10 z-10">
        <div className="flex flex-row gap-2 items-center">
          <ModelIcon type="aichat" size="md" />
          <p className="text-sm text-zinc-500">AIChat</p>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Avatar name="Deep" size="md" />
          <Button
            variant="secondary"
            size="iconSm"
            onClick={() => {
              open();
            }}
          >
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
