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
import { ArrowLeft02Icon, HugeiconsProps } from "@hugeicons/react";
import { usePathname, useRouter } from "next/navigation";
import { FC, ReactNode, RefAttributes, useEffect } from "react";

export type TSettingMenu = {
  name: string;
  icon: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>;
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
    console.log(pathname);
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
        size="default"
      >
        <Icon size={18} variant="solid" className="dark:text-zinc-500" />
        <span className={cn("text-xs font-medium md:flex md:text-sm")}>
          {menu.name}
        </span>
      </Button>
    );
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-white dark:bg-zinc-800 md:flex-row">
      <div className="no-scrollbar absolute left-0 right-0 top-0 flex w-full flex-row items-end gap-1 overflow-x-auto border-zinc-500/10 bg-zinc-50/50 px-2 pb-2 pt-2 dark:bg-zinc-900/50 md:bottom-0 md:h-full md:w-[30vw] md:flex-col md:gap-0 md:overflow-y-auto md:pb-16 md:pt-0">
        <div className="mt-[60px] flex w-full flex-row items-start justify-start gap-1 p-2 md:mt-0 md:w-[200px] md:flex-col md:p-4 md:pr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => push("/")}
            className="w-full justify-start gap-2"
          >
            <ArrowLeft02Icon size={18} variant="solid" /> Back
          </Button>
          <Flex
            direction="row"
            gap="xs"
            justify="start"
            className="w-full md:flex-col"
          >
            {settingMenu.map(renderMenuItem)}
          </Flex>
        </div>
      </div>
      <div className="no-scrollbar mt-32 h-full w-full max-w-[720px] overflow-y-auto p-0 pb-16 md:ml-[30vw] md:mt-0 md:p-8">
        {children}
      </div>
    </div>
  );
}
