import { TBot } from "@/hooks/use-bots";
import {
  BookBookmark,
  DotsThree,
  FolderSimple,
  Plus,
  TrashSimple,
} from "@phosphor-icons/react";
import { BotAvatar } from "../ui/bot-avatar";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export type TBotLibrary = {
  open: boolean;
  tab: "public" | "local";
  localBots: TBot[];
  publicBots: TBot[];
  onTabChange: (tab: "public" | "local") => void;
  onCreate: () => void;
  onDelete: (bot: TBot) => void;
  assignBot: (Bot: TBot) => void;
};

export const BotLibrary = ({
  open,
  tab,
  onCreate,
  onTabChange,
  localBots,
  publicBots,
  assignBot,
  onDelete,
}: TBotLibrary) => {
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
          {(tab === "local" ? localBots : publicBots)?.map((bot) => (
            <CommandItem
              value={bot.name}
              key={bot.id}
              className="w-full !px-2"
              onSelect={(value) => {
                assignBot(bot);
              }}
            >
              <div className="flex flex-row gap-3 p-1 items-center justify-start w-full overflow-hidden">
                <BotAvatar name={bot.name} size="medium" avatar={bot?.avatar} />
                <div className="flex flex-col items-start gap-0 w-full">
                  <p className="text-sm font-medium">{bot.name}</p>
                  <p className="text-xs text-zinc-500 w-full line-clamp-1">
                    {bot.description}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="iconSm">
                      <DotsThree size={24} weight="bold" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="min-w-[200px] text-sm md:text-base"
                    align="end"
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        onDelete(bot);
                        e.stopPropagation();
                      }}
                    >
                      <TrashSimple size={14} weight="bold" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </div>
    </Command>
  );
};
