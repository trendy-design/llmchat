import { TSettingMenu } from "@/app/settings/layout";
import { cn } from "@/libs/utils/clsx";
import { Button, Flex, Type } from "@/ui";
import {
  AudioLines,
  Bolt,
  Brain,
  ChevronLeft,
  Database,
  Sparkle,
  ToyBrick,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export const SettingsSidebar = () => {
  const { push } = useRouter();
  const pathname = usePathname();

  const settingMenu: TSettingMenu[] = [
    {
      name: "Common",
      icon: Bolt,
      route: "/settings/common",
    },
    {
      name: "LLMs",
      icon: Sparkle,
      route: "/settings/llms",
    },
    {
      name: "Plugins",
      icon: ToyBrick,
      route: "/settings/plugins",
    },
    {
      name: "Memory",
      icon: Brain,
      route: "/settings/memory",
    },
    {
      name: "Voice Input",
      icon: AudioLines,
      route: "/settings/voice",
    },
    {
      name: "Data",
      icon: Database,
      route: "/settings/data",
    },
  ];

  const renderMenuItem = (menu: TSettingMenu) => {
    const isSelected = pathname.startsWith(menu.route);
    const Icon = menu.icon;
    return (
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        key={menu.route}
        onClick={() => push(menu.route)}
        className="w-full justify-start gap-2"
      >
        <Icon size={16} strokeWidth={2} className="dark:text-zinc-500" />
        <span className={cn("font-medium md:flex")}>{menu.name}</span>
      </Button>
    );
  };

  return (
    <div className="relative flex h-[100dvh] w-[260px] flex-shrink-0 flex-row border-l">
      <Flex
        direction="col"
        gap="xs"
        justify="start"
        className="h-full w-[280px]"
      >
        <Flex
          justify="between"
          items="center"
          className="mt-2 w-full cursor-pointer border-b border-zinc-500/10 px-3 py-3"
          onClick={() => push("/chat")}
        >
          <ChevronLeft size={16} strokeWidth={2} className="w-8" />
          <Type className="w-full" size="base" weight="medium">
            Settings
          </Type>
        </Flex>
        <Flex className="w-full p-3" direction="col" gap="xs">
          {settingMenu.map(renderMenuItem)}
        </Flex>
      </Flex>
    </div>
  );
};
