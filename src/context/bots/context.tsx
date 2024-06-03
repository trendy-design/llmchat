"use client";

import { TBot } from "@/hooks/use-bots";
import { createContext, useContext } from "react";

export type TBotsContext = {
  open: (action?: "public" | "local" | "create") => void;
  dismiss: () => void;
  allBots: TBot[];
  assignBot: (bot: TBot) => void;
};
export const BotsContext = createContext<undefined | TBotsContext>(undefined);

export const useBots = () => {
  const context = useContext(BotsContext);
  if (context === undefined) {
    throw new Error("useBots must be used within a BotssProvider");
  }
  return context;
};
