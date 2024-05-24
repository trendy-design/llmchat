import { useSettings } from "@/context/settings/context";
import { DotsThree, GearSix, Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { ModelIcon } from "./icons/model-icon";
import { QuickSettings } from "./quick-settings";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { open: openSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute flex justify-between items-center p-2 md:p-4 flex-row top-0 left-0 right-0 bg-gradient-to-b from-white dark:from-zinc-800 to-transparent from-70% z-50">
      <div className="flex flex-row gap-2 items-center">
        <ModelIcon type="aichat" size="md" />
        <p className="text-sm text-zinc-500">AIChat</p>
        <Badge>Beta</Badge>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <QuickSettings />

        <DropdownMenu
          open={isOpen}
          onOpenChange={(open) => {
            document.body.style.pointerEvents = "auto";

            setIsOpen(open);
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="iconSm">
              <DotsThree size={24} weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[250px] text-sm mr-2">
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
          <DropdownMenuContent className="min-w-[250px] text-sm mr-2">
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
