"use client";
import { Flex } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  BrainIcon,
  DashboardCircleIcon,
  Database02Icon,
  Settings03Icon,
  SparklesIcon,
  VoiceIcon,
} from "@/components/ui/icons";
import { cn } from "@/helper/clsx";
import { HugeIcon } from "@/types/icons";
import { ArrowLeft01Icon } from "@hugeicons/react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export type TSettingMenu = {
  name: string;
  icon: HugeIcon;
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
      icon: Settings03Icon,
      route: "/settings/common",
    },
    {
      name: "LLMs",
      icon: SparklesIcon,
      route: "/settings/llms",
    },
    {
      name: "Plugins",
      icon: DashboardCircleIcon,
      route: "/settings/plugins",
    },
    {
      name: "Memory",
      icon: BrainIcon,
      route: "/settings/memory",
    },
    {
      name: "Voice Input",
      icon: VoiceIcon,
      route: "/settings/voice",
    },
    {
      name: "Data",
      icon: Database02Icon,
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
        size="sm"
      >
        <Icon size={16} strokeWidth={2} className="dark:text-zinc-500" />
        <span className={cn("text-xs font-medium md:flex md:text-sm")}>
          {menu.name}
        </span>
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
            size="sm"
            onClick={() => {
              push("/chat");
            }}
          >
            <ArrowLeft01Icon size={16} />
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
