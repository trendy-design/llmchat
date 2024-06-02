import { get, set } from "idb-keyval";
import { v4 } from "uuid";
import { TModelKey } from "./use-model-list";

export type TBot = {
  prompt: string;
  name: string;
  description: string;
  greetingMessage?: string;
  id: string;
  avatar?: string;
  status?: string;
  deafultBaseModel: TModelKey;
};

export const useBots = () => {
  const getBots = async (): Promise<TBot[]> => {
    return (await get("bots")) || [];
  };

  const createBot = async (bot: Omit<TBot, "id">) => {
    const bots = await getBots();
    const newBots = [...bots, { ...bot, id: v4() }];
    set("bots", newBots);
  };

  const publishBot = async (botId: string) => {
    // TODO: Implement publishBot
  };

  const fetchPublicBots = async (): Promise<TBot[]> => {
    // TODO: Implement publishBot

    return [];
  };

  const updateBot = async (botId: string, bot: TBot) => {
    const bots = await getBots();
    const newBots = bots.map((bot) => {
      if (bot.id === botId) {
        return bot;
      }
      return bot;
    });
  };
  return { getBots, createBot, updateBot };
};
