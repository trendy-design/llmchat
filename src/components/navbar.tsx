import { useSettings } from "@/context/settings/context";
import { DotsThree, GearSix, Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { ModelIcon } from "./icons/model-icon";
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
  return (
    <div className="absolute flex justify-between items-center p-4 flex-row top-0 left-0 right-0 bg-gradient-to-b dark:from-zinc-800 dark:to-transparent from-70% z-10">
      <div className="flex flex-row gap-2 items-center">
        <ModelIcon type="aichat" size="md" />
        <p className="text-sm text-zinc-500">AIChat</p>
        <Badge>Beta</Badge>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="iconSm">
              <DotsThree size={20} weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[200px] text-sm">
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
        </DropdownMenu>
      </div>
    </div>
  );
};
