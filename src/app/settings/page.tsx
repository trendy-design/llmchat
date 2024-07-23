"use client";
import { CommonSettings } from "@/components/settings/common";
import { Data } from "@/components/settings/data";
import { MemorySettings } from "@/components/settings/memory";
import { ModelSettings } from "@/components/settings/models";
import { PulginSettings } from "@/components/settings/plugins";
import { VoiceInput } from "@/components/settings/voice-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BrainIcon,
  DashboardCircleIcon,
  Database02Icon,
  Settings03Icon,
  SparklesIcon,
  VoiceIcon,
} from "@hugeicons/react";
import { useState } from "react";

export type TSettingMenuItem = {
  name: string;
  key: string;
  icon: () => React.ReactNode;
  component: React.ReactNode;
};

export type TSettingRoutes =
  | "common"
  | "models"
  | "models/anthropic"
  | "models/openai"
  | "models/gemini"
  | "models/ollama"
  | "plugins"
  | "plugins/web-search"
  | "memory"
  | "voice-input"
  | "data";

export default function SettingsPage() {
  const [selectedMenu, setSelectedMenu] = useState<TSettingRoutes>("common");

  const settingMenu: TSettingMenuItem[] = [
    {
      name: "Common",
      icon: () => <Settings03Icon size={18} strokeWidth="2" />,
      key: "common",
      component: <CommonSettings />,
    },
    {
      name: "LLMs",
      icon: () => <SparklesIcon size={18} strokeWidth="2" />,
      key: "models",
      component: <ModelSettings />,
    },
    {
      name: "Plugins",
      icon: () => <DashboardCircleIcon size={18} strokeWidth="2" />,
      key: "plugins",
      component: <PulginSettings />,
    },
    {
      name: "Memory",
      icon: () => <BrainIcon size={18} strokeWidth="2" />,
      key: "memory",
      component: <MemorySettings />,
    },
    {
      name: "Voice Input",
      icon: () => <VoiceIcon size={18} strokeWidth="2" />,
      key: "voice-input",
      component: <VoiceInput />,
    },
    {
      name: "Data",
      icon: () => <Database02Icon size={18} strokeWidth="2" />,
      key: "data",
      component: <Data />,
    },
  ];

  const selectedMenuItem = settingMenu.find((menu) =>
    selectedMenu.startsWith(menu.key)
  );

  return (
    <div className="w-full h-screen bg-zinc-800 gap-0 flex flex-col overflow-hidden p-0">
      <div className="flex flex-col md:flex-row w-full relative h-screen overflow-hidden">
        <div className="w-full md:w-[420px] bg-zinc-900/50 px-2  pt-2 pb-2 md:pb-16 border-zinc-500/10 absolute md:h-full overflow-x-auto md:overflow-y-auto no-scrollbar left-0 top-0 right-0 md:bottom-0 flex flex-row md:flex-col items-end md:gap-0 gap-1">
          <div className="w-[200px] flex flex-col gap-1 p-4">
            {settingMenu.map((menu) => (
              <Button
                variant={selectedMenu === menu.key ? "secondary" : "ghost"}
                key={menu.key}
                onClick={() => setSelectedMenu(menu.key as TSettingRoutes)}
                className="justify-start gap-2 px-2"
                size="default"
              >
                <div className="w-6 h-6 flex flex-row items-center justify-center">
                  {menu.icon()}
                </div>
                <span
                  className={cn(
                    "text-xs md:text-sm md:flex font-medium",
                    selectedMenu === menu.key ? "flex" : "hidden"
                  )}
                >
                  {menu.name}
                </span>
              </Button>
            ))}
          </div>
        </div>
        <div className="md:ml-[420px] max-w-[700px] mt-12 p-8 md:mt-0 pb-16 w-full h-full overflow-y-auto no-scrollbar">
          {selectedMenuItem?.component}
        </div>
      </div>
    </div>
  );
}
