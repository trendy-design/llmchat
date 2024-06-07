import { useMutation, useQuery } from "@tanstack/react-query";
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

  const deleteBot = async (id: string) => {
    const bots = await getBots();
    const newBots = bots?.filter((bot) => bot.id !== id) || [];
    set("bots", newBots);
  };

  const updateBot = async (botId: string, newBot: Omit<TBot, "id">) => {
    const bots = await getBots();
    const newBots = bots.map((bot) => {
      if (bot.id === botId) {
        return { ...bot, ...newBot };
      }
      return bot;
    });
    set("bots", newBots);
  };

  const botsQuery = useQuery({
    queryKey: ["bots"],
    queryFn: getBots,
  });

  const createBotMutation = useMutation({
    mutationFn: createBot,
    onSuccess: () => {
      botsQuery.refetch();
    },
  });

  const deleteBotMutation = useMutation({
    mutationFn: deleteBot,
    onSuccess: () => {
      botsQuery.refetch();
    },
  });

  const updateBotMutation = useMutation({
    mutationFn: ({
      botId,
      newBot,
    }: {
      botId: string;
      newBot: Omit<TBot, "id">;
    }) => updateBot(botId, newBot),
    onSuccess: () => {
      botsQuery.refetch();
    },
  });
  return {
    getBots,
    createBot,
    updateBot,
    botsQuery,
    createBotMutation,
    updateBotMutation,
    deleteBotMutation,
  };
};
