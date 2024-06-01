import { useChatContext } from "@/context/chat/context";
import { useFilters } from "@/context/filters/context";
import { usePrompts } from "@/context/prompts/context";
import { useSettings } from "@/context/settings/context";
import {
  Command,
  DotsThree,
  GearSix,
  Moon,
  Plus,
  Robot,
  Sun,
  Textbox,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ModelIcon } from "./icons/model-icon";
import { HistorySidebar } from "./side-bar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ComingSoon } from "./ui/coming-soon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip } from "./ui/tooltip";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { open: openSettings } = useSettings();
  const { open: openFilters } = useFilters();
  const { open: openPrompts } = usePrompts();
  const [isOpen, setIsOpen] = useState(false);
  const { push } = useRouter();
  const { createSession } = useChatContext();

  const renderNewSession = () => {
    return (
      <Tooltip content="New Session">
        <Button
          size="icon"
          variant={"ghost"}
          className="min-w-8 h-8"
          onClick={() => {
            createSession().then((session) => {
              push(`/chat/${session.id}`);
            });
          }}
        >
          <Plus size={20} weight="bold" />
        </Button>
      </Tooltip>
    );
  };

  return (
    <div className="absolute flex justify-between items-center p-2 pb-6 md:p-3 flex-row top-0 left-0 right-0 bg-gradient-to-b from-white dark:from-zinc-800 to-transparent from-70% z-50">
      <div className="flex flex-row gap-2 items-center">
        <HistorySidebar />
        <ModelIcon type="aichat" size="md" />
        <p className="text-sm md:text-base text-zinc-500">LLMChat</p>
        <Badge>Beta</Badge>
      </div>
      <div className="flex flex-row gap-2 items-center">
        {renderNewSession()}
        <Button
          variant="ghost"
          size="iconSm"
          onClick={openFilters}
          className="flex md:hidden"
        >
          <Command size={20} weight="bold" />
        </Button>

        <DropdownMenu
          open={isOpen}
          onOpenChange={(open) => {
            document.body.style.pointerEvents = "auto";

            setIsOpen(open);
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="iconSm">
              <DotsThree size={24} weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[250px] text-sm md:text-base mr-2">
            <DropdownMenuItem
              onClick={() => {
                openSettings();
              }}
            >
              <GearSix size={14} weight="bold" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setTheme(theme === "light" ? "dark" : "light");
              }}
            >
              {theme === "light" ? (
                <Moon size={14} weight="bold" />
              ) : (
                <Sun size={14} weight="bold" />
              )}
              Switch to {theme === "light" ? "dark" : "light"} mode
            </DropdownMenuItem>
          </DropdownMenuContent>
          <DropdownMenuContent className="min-w-[250px] text-sm md:text-base mr-2">
            <DropdownMenuItem onClick={() => {}}>
              <Robot size={14} weight="bold" />
              Bots
              <ComingSoon />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                openPrompts();
              }}
            >
              <Textbox size={14} weight="bold" />
              Prompts
              <ComingSoon />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                openSettings();
              }}
            >
              <GearSix size={14} weight="bold" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setTheme(theme === "light" ? "dark" : "light");
              }}
            >
              {theme === "light" ? (
                <Moon size={14} weight="bold" />
              ) : (
                <Sun size={14} weight="bold" />
              )}
              Switch to {theme === "light" ? "dark" : "light"} mode
            </DropdownMenuItem>
            <div className="my-1 h-[1px] bg-black/10 dark:bg-white/10 w-full" />
            <DropdownMenuItem onClick={() => {}}>About</DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>Feedback</DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>Support</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
