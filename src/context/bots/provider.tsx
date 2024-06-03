"use client";
import { BotLibrary } from "@/components/bots/bot-library";
import { CreateBot } from "@/components/bots/create-bot";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TBot, useBots } from "@/hooks/use-bots";
import { useChatSession } from "@/hooks/use-chat-session";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
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
  const [localBots, setLocalBots] = useState<TBot[]>([]);
  const { getBots } = useBots();

  const open = (action?: "public" | "local" | "create") => {
    if (action === "create") {
      setShowCreateBot(true);
    } else {
      action && setTab(action);
    }
    setIsBotOpen(true);
  };

  const dismiss = () => setIsBotOpen(false);

  const query = useQuery<{ bots: TBot[] }>({
    queryKey: ["Bots"],
    queryFn: async () => axios.get("/api/bots").then((res) => res.data),
  });

  useEffect(() => {
    getBots().then((Bots) => {
      setLocalBots(Bots);
    });
  }, []);

  const allBots = [...localBots, ...(query.data?.bots || [])];

  const assignBot = (bot: TBot) => {
    if (!currentSession?.messages?.length) {
      currentSession?.id &&
        updateSession(currentSession?.id, { bot }).then(() => {
          refetchCurrentSession();
        });
    } else {
      createSession(bot, true);
    }
    dismiss();
  };

  return (
    <BotsContext.Provider value={{ open, dismiss, allBots, assignBot }}>
      {children}

      <Dialog open={isBotOpen} onOpenChange={setIsBotOpen}>
        <DialogContent className="w-[96dvw] max-h-[80dvh] rounded-2xl md:min-w-[640px] gap-0 md:max-h-[600px] flex flex-col overflow-hidden border border-white/5 p-0">
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
              localBots={localBots}
              publicBots={query.data?.bots || []}
              assignBot={assignBot}
              onTabChange={setTab}
              onCreate={() => setShowCreateBot(true)}
            />
          )}
        </DialogContent>
      </Dialog>
    </BotsContext.Provider>
  );
};
