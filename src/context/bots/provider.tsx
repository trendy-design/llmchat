"use client";
import { BotLibrary } from "@/components/bots/bot-library";
import { CreateBot } from "@/components/bots/create-bot";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TBot } from "@/hooks/use-bots";
import { useChatSession } from "@/hooks/use-chat-session";
import { useState } from "react";
import { useChatContext } from "../chat/context";
import { BotsContext } from "./context";

export type TBotsProvider = {
  children: React.ReactNode;
};

export type TBotMenuItem = {
  name: string;
  key: string;
  icon: () => React.ReactNode;
  component: React.ReactNode;
};
export const BotsProvider = ({ children }: TBotsProvider) => {
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [showCreateBot, setShowCreateBot] = useState(false);
  const [tab, setTab] = useState<"public" | "local">("public");
  const { currentSession, createSession, refetchCurrentSession } =
    useChatContext();
  const { updateSession } = useChatSession();

  const open = (action?: "public" | "local" | "create") => {
    if (action === "create") {
      setShowCreateBot(true);
    } else {
      action && setTab(action);
    }
    setIsBotOpen(true);
  };

  const dismiss = () => setIsBotOpen(false);

  return (
    <BotsContext.Provider value={{ open, dismiss }}>
      {children}

      <Dialog open={isBotOpen} onOpenChange={setIsBotOpen}>
        <DialogContent className="w-[96dvw] max-h-[80dvh] rounded-2xl md:min-w-[600px] gap-0 md:max-h-[600px] flex flex-col overflow-hidden border border-white/5 p-0">
          {showCreateBot ? (
            <CreateBot
              open={showCreateBot}
              onOpenChange={(isOpen) => {
                setShowCreateBot(isOpen);
                if (!isOpen) {
                  setTab("local");
                }
              }}
            />
          ) : (
            <BotLibrary
              open={!showCreateBot}
              tab={tab}
              assignBot={(bot: TBot) => {
                if (!currentSession?.messages?.length) {
                  currentSession?.id &&
                    updateSession(currentSession?.id, { bot }).then(() => {
                      refetchCurrentSession();
                    });
                } else {
                  createSession(bot, true);
                }
                dismiss();
              }}
              onTabChange={setTab}
              onCreate={() => setShowCreateBot(true)}
            />
          )}
        </DialogContent>
      </Dialog>
    </BotsContext.Provider>
  );
};
