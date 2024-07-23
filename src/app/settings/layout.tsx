"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BrainIcon,
  Cancel01Icon,
  DashboardCircleIcon,
  Database02Icon,
  HugeiconsProps,
  Settings03Icon,
  SparklesIcon,
  VoiceIcon,
} from "@hugeicons/react";
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
        className="justify-start gap-2 px-2"
        size="default"
      >
        <div className="w-6 h-6 flex flex-row items-center justify-center">
          <Icon size={18} variant="solid" className="dark:text-zinc-500" />
        </div>
        <span
          className={cn(
            "text-xs md:text-sm md:flex font-medium",
            isSelected ? "flex" : "hidden"
          )}
        >
          {menu.name}
        </span>
      </Button>
    );
  };

  return (
    <div className="flex flex-col md:flex-row w-full relative h-screen overflow-hidden bg-white dark:bg-zinc-800">
      <Button
        size="iconSm"
        className="w-10 h-10 rounded-full absolute top-8 right-8"
        onClick={() => push("/")}
      >
        <Cancel01Icon size={18} strokeWidth={2} />
      </Button>
      <div className="w-full md:w-[420px] bg-zinc-50 dark:bg-zinc-900/50 px-2  pt-2 pb-2 md:pb-16 border-zinc-500/10 absolute md:h-full overflow-x-auto md:overflow-y-auto no-scrollbar left-0 top-0 right-0 md:bottom-0 flex flex-row md:flex-col items-end md:gap-0 gap-1">
        <div className="w-[200px] flex flex-col gap-1 p-4">
          {settingMenu.map(renderMenuItem)}
        </div>
      </div>
      <div className="md:ml-[420px] max-w-[700px] mt-12 p-8 md:mt-0 pb-16 w-full h-full overflow-y-auto no-scrollbar">
        {children}
      </div>
    </div>
  );
}
