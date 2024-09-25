import { TSettingMenu } from "@/app/settings/layout";
import { cn } from "@/libs/utils/clsx";
import { Button, Flex } from "@/ui";
import { motion } from "framer-motion";
import {
  AudioLines,
  Bolt,
  Brain,
  Database,
  Sparkle,
  ToyBrick,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export const SettingsTabs = () => {
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
      <Flex direction="col" gap="sm" className="relative pb-2">
        <Button
          variant={"ghost"}
          key={menu.route}
          size="sm"
          onClick={() => push(menu.route)}
          className="w-full justify-start gap-2"
        >
          <Icon
            size={14}
            strokeWidth={2}
            className="opacity-50 dark:text-zinc-500"
          />
          <span className={cn("font-medium md:flex")}>{menu.name}</span>
        </Button>
        {isSelected && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-800 dark:bg-white"
            layoutId="underline"
            initial={false}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}
      </Flex>
    );
  };

  return (
    <Flex
      direction="row"
      gap="xs"
      className="no-scrollbar w-full overflow-x-auto"
    >
      {settingMenu.map(renderMenuItem)}
    </Flex>
  );
};
