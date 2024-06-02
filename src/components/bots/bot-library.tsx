import { TBot, useBots } from "@/hooks/use-bots";
import { BookBookmark, FolderSimple, Plus } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { BotAvatar } from "../ui/bot-avatar";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

export type TBotLibrary = {
  open: boolean;
  tab: "public" | "local";
  onTabChange: (tab: "public" | "local") => void;
  onCreate: () => void;
  assignBot: (Bot: TBot) => void;
};

export const BotLibrary = ({
  open,
  tab,
  onCreate,
  onTabChange,
  assignBot,
}: TBotLibrary) => {
  const [localBots, setLocalBots] = useState<TBot[]>([]);
  const { getBots } = useBots();

  const query = useQuery<{ Bots: TBot[] }>({
    queryKey: ["Bots"],
    queryFn: async () => axios.get("/api/Bots").then((res) => res.data),
  });

  useEffect(() => {
    getBots().then((Bots) => {
      console.log(Bots);
      setLocalBots(Bots);
    });
  }, [open]);

  return (
    <Command>
      <div className="w-full p-1">
        <CommandInput placeholder="Search Bots" />
      </div>

      <div className="flex flex-col w-full mt-60 md:mt-0 border-t border-zinc-500/20 relative h-full">
        <div className="w-full flex flex-row justify-between px-3 pt-3 pb-3">
          <div className="flex flex-row gap-2 items-center">
            <Button
              size="sm"
              variant={tab === "public" ? "secondary" : "ghost"}
              onClick={() => {
                onTabChange("public");
              }}
            >
              <BookBookmark size={16} weight="bold" /> Bot Library
            </Button>

            <Button
              size="sm"
              variant={tab === "local" ? "secondary" : "ghost"}
              onClick={() => {
                onTabChange("local");
              }}
            >
              <FolderSimple size={16} weight="bold" /> Your Bots
            </Button>
          </div>
          <Button size="sm" onClick={onCreate}>
            <Plus size={16} weight="bold" /> Create Bot
          </Button>
        </div>
        <CommandEmpty className="text-sm text-zinc-500 w-full flex flex-col items-center justify-center gap-2 p-4">
          No Bots found{" "}
          <Button variant="outline" size="sm" onClick={onCreate}>
            Create new Bot
          </Button>
        </CommandEmpty>
        <CommandList className="px-2 py-2">
          {(tab === "local" ? localBots : query?.data?.Bots)?.map((Bot) => (
            <CommandItem
              value={Bot.name}
              key={Bot.id}
              className="w-full !px-2"
              onSelect={(value) => {
                assignBot(Bot);
              }}
            >
              <div className="flex flex-row gap-2 p-1 items-center justify-start w-full overflow-hidden">
                <BotAvatar name={Bot.name} size={40} />
                <div className="flex flex-col items-start gap-0 w-full">
                  <p className="text-base font-medium">{Bot.name}</p>
                  <p className="text-xs text-zinc-500 w-full line-clamp-1">
                    {Bot.description}
                  </p>
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </div>
    </Command>
  );
};
