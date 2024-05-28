import { get } from "idb-keyval";
import { TModelKey } from "./use-model-list";

export type TBot = {
  prompt: string;
  name: string;
  description: string;
  id: string;
  avatar: string;
  status: string;
  deafultBaseModel: TModelKey;
};

export const useBots = () => {
  const getBots = async (): Promise<TBot[]> => {
    return (await get("bots")) || [];
  };

  const createBot = async (bot: TBot) => {
    const bots = await getBots();
    const newBots = [...bots, bot];
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
