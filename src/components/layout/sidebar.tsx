import {
  Moon02Icon,
  MoreHorizontalIcon,
  NoteIcon,
  PlusSignIcon,
  Settings03Icon,
  Sun01Icon,
} from "@/components/ui/icons";
import { usePromptsContext, useSessions } from "@/context";
import { useTheme } from "next-themes";
import { useState } from "react";
import { HistorySidebar } from "../history/history-side-bar";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Tooltip,
} from "@/components/ui";
import { FolderLibraryIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";

export const Sidebar = () => {
  const { theme, setTheme } = useTheme();
  const { push } = useRouter();
  const { open: openPrompts } = usePromptsContext();
  const [isOpen, setIsOpen] = useState(false);
  const { createSession } = useSessions();

  const renderNewSession = () => {
    return (
      <Tooltip content="New Session" side="left" sideOffset={4}>
        <Button
          size="icon"
          variant={"ghost"}
          className="h-8 min-w-8"
          onClick={() => {
            createSession({
              redirect: true,
            });
          }}
        >
          <PlusSignIcon size={20} strokeWidth={2} />
        </Button>
      </Tooltip>
    );
  };

  const menuItems = [
    { label: "About", onClick: () => {} },
    { label: "Feedback", onClick: () => {} },
    { label: "Support", onClick: () => {} },
  ];

  const renderSpaces = () => {
    return (
      <Tooltip content="Spaces (coming soon)" side="left" sideOffset={4}>
        <Button size="iconSm" variant="ghost">
          <FolderLibraryIcon size={20} strokeWidth={2} />
        </Button>
      </Tooltip>
    );
  };

  const renderPrompts = () => {
    return (
      <Tooltip content="Prompts" side="left" sideOffset={4}>
        <Button
          size="iconSm"
          variant="ghost"
          onClick={() => {
            openPrompts();
          }}
        >
          <NoteIcon size={20} strokeWidth={2} />
        </Button>
      </Tooltip>
    );
  };

  const renderSettings = () => {
    return (
      <Tooltip content="Settings" side="left" sideOffset={4}>
        <Button
          size="iconSm"
          variant="ghost"
          onClick={() => {
            push("/settings");
          }}
        >
          <Settings03Icon size={20} strokeWidth={2} />
        </Button>
      </Tooltip>
    );
  };

  return (
    <div className="flex flex-row items-center justify-center gap-3 border-zinc-500/5 p-3 pb-6 dark:border-zinc-500/5 md:h-screen md:flex-col md:border-r">
      <div className="flex flex-row items-center gap-2">
        {renderNewSession()}
      </div>

      <div className="flex flex-col items-center gap-2">
        <HistorySidebar />
      </div>
      {renderPrompts()}
      {renderSpaces()}

      <Flex className="flex-1" />
      {renderSettings()}
      <DropdownMenu
        open={isOpen}
        onOpenChange={(open: boolean) => {
          document.body.style.pointerEvents = "auto";
          setIsOpen(open);
        }}
      >
        <Tooltip content="More" side="left" sideOffset={4}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="iconSm">
              <MoreHorizontalIcon size={20} variant="solid" />
            </Button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent
          className="mr-2 min-w-[250px] text-sm md:text-base"
          align="end"
          side="left"
          sideOffset={4}
        >
          {menuItems.map((item, index) => (
            <DropdownMenuItem key={index} onClick={item.onClick}>
              {item.label}
            </DropdownMenuItem>
          ))}
          <div className="my-1 h-[1px] w-full bg-black/10 dark:bg-white/10" />

          <DropdownMenuItem
            onClick={() => {
              setTheme(theme === "light" ? "dark" : "light");
            }}
          >
            {theme === "light" ? (
              <Moon02Icon size={18} variant="stroke" strokeWidth="2" />
            ) : (
              <Sun01Icon size={18} variant="stroke" strokeWidth="2" />
            )}
            Switch to {theme === "light" ? "dark" : "light"} mode
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
