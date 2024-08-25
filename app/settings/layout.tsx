"use client";
import { cn } from "@/lib/utils/clsx";
import { LucideIcon } from "@/libs/types/icons";
import { Button, Flex } from "@/ui";
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
import { ReactNode, useEffect } from "react";

export type TSettingMenu = {
  name: string;
  icon: LucideIcon;
  route: string;
};

export default function SettingsPage({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const { push } = useRouter();

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

  useEffect(() => {
    if (pathname === "/settings") {
      push("/settings/common");
    }
  }, [pathname]);

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
    <Flex justify="center" className="w-full">
      <Flex className="relative h-[100dvh] w-[820px]">
        <Flex
          direction="col"
          gap="xs"
          justify="start"
          className="w-[180px] pt-[60px]"
        >
          <Button
            className="w-full"
            variant="bordered"
            onClick={() => {
              push("/chat");
            }}
          >
            <ChevronLeft size={16} strokeWidth={2} />
            Back
          </Button>
          <div className="h-2" />

          {settingMenu.map(renderMenuItem)}
        </Flex>
        <Flex className="no-scrollbar h-full w-full flex-1 overflow-y-auto px-4 py-[60px]">
          {children}
        </Flex>
      </Flex>
    </Flex>
  );
}
