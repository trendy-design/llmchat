"use client";
import { CommonSettings } from "@/components/settings/common";
import { Data } from "@/components/settings/data";
import { MemorySettings } from "@/components/settings/memory";
import { ModelSettings } from "@/components/settings/models";
import { PulginSettings } from "@/components/settings/plugins";
import { VoiceInput } from "@/components/settings/voice-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

import { createContext, useContext } from "react";

export type TSettingsContext = {
  open: (route?: TSettingRoutes) => void;
  dismiss: () => void;
  selected: TSettingRoutes;
};
export const SettingsContext = createContext<undefined | TSettingsContext>(
  undefined
);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingssProvider");
  }
  return context;
};

export type TSettingsProvider = {
  children: React.ReactNode;
};

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

export const SettingsProvider = ({ children }: TSettingsProvider) => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<TSettingRoutes>("common");

  const open = (route?: TSettingRoutes) => {
    setIsSettingOpen(true);
    setSelectedMenu(route || "common");
  };

  const dismiss = () => setIsSettingOpen(false);

  const settingMenu: TSettingMenuItem[] = [
    {
      name: "Common",
      icon: () => <Settings03Icon size={18} strokeWidth="2" />,
      key: "common",
      component: <CommonSettings />,
    },
    {
      name: "Models",
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
    <SettingsContext.Provider value={{ open, dismiss, selected: selectedMenu }}>
      {children}

      <Dialog open={isSettingOpen} onOpenChange={setIsSettingOpen}>
        <DialogContent className="w-[96dvw] max-h-[80dvh] rounded-2xl md:min-w-[800px] gap-0 md:h-[600px] flex flex-col overflow-hidden border border-white/5 p-0">
          <div className="w-full px-4 py-3 border-b border-zinc-500/20">
            <p className="text-md font-medium">Settings</p>
          </div>
          <div className="flex flex-col md:flex-row w-full relative h-full overflow-hidden">
            <div className="w-full md:w-[220px] px-2  pt-2 pb-2 md:pb-16 border-zinc-500/10 absolute md:h-full overflow-x-auto md:overflow-y-auto no-scrollbar left-0 top-0 right-0 md:bottom-0 flex flex-row md:flex-col md:gap-0 gap-1">
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
            <div className="md:ml-[220px] mt-12 md:mt-0 pb-16 w-full h-full overflow-y-auto no-scrollbar">
              {selectedMenuItem?.component}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SettingsContext.Provider>
  );
};
