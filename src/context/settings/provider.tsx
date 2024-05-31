"use client";
import { ModelIcon } from "@/components/icons/model-icon";
import { AnthropicSettings } from "@/components/settings/anthropic";
import { CommonSettings } from "@/components/settings/common";
import { Data } from "@/components/settings/data";
import { GeminiSettings } from "@/components/settings/gemini";
import { OpenAISettings } from "@/components/settings/openai";
import { WebSearchPlugin } from "@/components/settings/plugins/web-search";
import { VoiceInput } from "@/components/settings/voice-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Database, GearSix, Microphone } from "@phosphor-icons/react";
import { useState } from "react";
import { SettingsContext } from "./context";

export type TSettingsProvider = {
  children: React.ReactNode;
};

export type TSettingMenuItem = {
  name: string;
  key: string;
  icon: () => React.ReactNode;
  component: React.ReactNode;
};
export const SettingsProvider = ({ children }: TSettingsProvider) => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("common");

  const open = (key?: string) => {
    setIsSettingOpen(true);
    setSelectedMenu(key || "common");
  };

  const dismiss = () => setIsSettingOpen(false);

  const settingMenu: TSettingMenuItem[] = [
    {
      name: "Common",
      icon: () => <GearSix size={16} weight="bold" />,
      key: "common",
      component: <CommonSettings />,
    },
    {
      name: "Voice Input",
      icon: () => <Microphone size={16} weight="bold" />,
      key: "voice-input",
      component: <VoiceInput />,
    },
    {
      name: "Data",
      icon: () => <Database size={16} weight="bold" />,
      key: "Your Data",
      component: <Data />,
    },
  ];

  const modelsMenu: TSettingMenuItem[] = [
    {
      name: "OpenAI",
      key: "openai",
      icon: () => <ModelIcon size="md" type="openai" />,
      component: <OpenAISettings />,
    },
    {
      name: "Anthropic",
      key: "anthropic",
      icon: () => <ModelIcon size="md" type="anthropic" />,
      component: <AnthropicSettings />,
    },
    {
      name: "Gemini",
      key: "gemini",
      icon: () => <ModelIcon size="md" type="gemini" />,

      component: <GeminiSettings />,
    },
  ];
  const pluginsMenu: TSettingMenuItem[] = [
    {
      name: "Web Search",
      key: "web-search",
      icon: () => <ModelIcon size="md" type="websearch" />,
      component: <WebSearchPlugin />,
    },
  ];

  const allMenus = [...settingMenu, ...modelsMenu, ...pluginsMenu];

  const selectedMenuItem = allMenus.find((menu) => menu.key === selectedMenu);

  console.log(selectedMenuItem, selectedMenu);

  return (
    <SettingsContext.Provider value={{ open, dismiss }}>
      {children}

      <Dialog open={isSettingOpen} onOpenChange={setIsSettingOpen}>
        <DialogContent className="w-[96dvw] max-h-[80dvh] rounded-xl md:min-w-[800px] gap-0 md:h-[600px] flex flex-col overflow-hidden border border-white/5 p-0">
          <div className="w-full px-4 py-3 border-b border-zinc-500/20">
            <p className="text-md font-medium">Settings</p>
          </div>
          <div className="flex flex-col md:flex-row w-full relative h-full">
            <div className="w-full md:w-[250px] px-2 border-r border-zinc-500/10 absolute left-0 top-0 right-0 md:bottom-0 flex flex-row md:flex-col md:gap-0 gap-1">
              <p className="px-2 py-2 hidden md:flex text-xs md:text-xs font-medium text-zinc-500">
                GENERAL
              </p>
              {settingMenu.map((menu) => (
                <Button
                  variant={selectedMenu === menu.key ? "secondary" : "ghost"}
                  key={menu.key}
                  onClick={() => setSelectedMenu(menu.key)}
                  className="justify-start gap-2 px-2"
                  size="default"
                >
                  <div className="w-6 h-6 flex flex-row items-center justify-center">
                    {menu.icon()}
                  </div>
                  <span
                    className={cn(
                      "text-sm md:text-base md:flex",
                      selectedMenu === menu.key ? "flex" : "hidden"
                    )}
                  >
                    {menu.name}
                  </span>
                </Button>
              ))}
              <p className="px-2 py-2 text-xs md:text-xs hidden md:flex  font-medium text-zinc-500">
                MODELS
              </p>
              {modelsMenu.map((menu) => (
                <Button
                  variant={selectedMenu === menu.key ? "secondary" : "ghost"}
                  key={menu.key}
                  onClick={() => setSelectedMenu(menu.key)}
                  className="justify-start gap-2 px-2"
                  size="default"
                >
                  {menu.icon()}
                  <span
                    className={cn(
                      "text-sm md:text-base md:flex",
                      selectedMenu === menu.key ? "flex" : "hidden"
                    )}
                  >
                    {" "}
                    {menu.name}
                  </span>
                </Button>
              ))}
              <p className="px-2 py-2 text-xs md:text-xs hidden md:flex  font-medium text-zinc-500">
                PLUGINS
              </p>
              {pluginsMenu.map((menu) => (
                <Button
                  variant={selectedMenu === menu.key ? "secondary" : "ghost"}
                  key={menu.key}
                  onClick={() => setSelectedMenu(menu.key)}
                  className="justify-start gap-2 px-2"
                  size="default"
                >
                  {menu.icon()}
                  <span
                    className={cn(
                      "text-sm md:text-base md:flex",
                      selectedMenu === menu.key ? "flex" : "hidden"
                    )}
                  >
                    {" "}
                    {menu.name}
                  </span>
                </Button>
              ))}
            </div>
            <div className="md:ml-[250px] pb-16 w-full h-full overflow-y-auto no-scrollbar">
              {selectedMenuItem?.component}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SettingsContext.Provider>
  );
};
