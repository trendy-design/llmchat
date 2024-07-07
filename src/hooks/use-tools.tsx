import { usePreferenceContext, useSettingsContext } from "@/context";
import { dalleTool } from "@/tools/dalle";
import { duckduckGoTool } from "@/tools/duckduckgo";
import { googleSearchTool } from "@/tools/google";
import {
  GlobalSearchIcon,
  HugeiconsProps,
  Image01Icon,
} from "@hugeicons/react";
import { Globe } from "@phosphor-icons/react";
import { FC, ReactNode, RefAttributes } from "react";
import { TApiKeys, TPreferences } from ".";

export const toolKeys = ["calculator", "web_search"];

export type TToolResponseArgs = {
  toolName: string;
  toolArgs: any;
  toolResult: any;
};

export type TToolArg = {
  preferences: TPreferences;
  apiKeys: TApiKeys;
  toolResponse: (response: TToolResponseArgs) => void;
};

export type TToolKey = (typeof toolKeys)[number];
export type IconSize = "sm" | "md" | "lg";
export type TTool = {
  key: TToolKey;
  description: string;
  name: string;
  loadingMessage?: string;
  resultMessage?: string;
  isBeta?: boolean;
  renderUI?: (args: any) => ReactNode;
  showInMenu?: boolean;
  validate?: () => Promise<boolean>;
  validationFailedAction?: () => void;
  tool: (args: TToolArg) => any;
  icon: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>;
  smallIcon: () => ReactNode;
};

export const useTools = () => {
  const { preferences, apiKeys } = usePreferenceContext();
  const { open } = useSettingsContext();

  const tools: TTool[] = [
    {
      key: "web_search",
      description: "Search on web",
      tool:
        preferences?.defaultWebSearchEngine === "google"
          ? googleSearchTool
          : duckduckGoTool,
      name: "Web Search",
      isBeta: true,
      showInMenu: true,
      validate: async () => {
        if (
          preferences?.defaultWebSearchEngine === "google" &&
          (!preferences?.googleSearchApiKey ||
            !preferences?.googleSearchEngineId)
        ) {
          return false;
        }
        return true;
      },
      validationFailedAction: () => {
        open("web-search");
      },
      loadingMessage:
        preferences?.defaultWebSearchEngine === "google"
          ? "Searching on Google..."
          : "Searching on DuckDuckGo...",
      resultMessage:
        preferences?.defaultWebSearchEngine === "google"
          ? "Results from Google search"
          : "Result from DuckDuckGo search",
      icon: GlobalSearchIcon,
      smallIcon: () => <Globe size={16} weight="bold" />,
    },
    {
      key: "image",
      description: "Generate images",
      tool: dalleTool,
      name: "Dalle",
      isBeta: true,
      showInMenu: true,
      validate: async () => {
        return true;
      },
      validationFailedAction: () => {
        open("web-search");
      },
      loadingMessage: "Generating Image",
      resultMessage: "Generated Image",
      icon: Image01Icon,
      smallIcon: () => <Globe size={16} weight="bold" />,
    },
  ];

  const getToolByKey = (key: TToolKey) => {
    return tools.find((tool) => tool.key.includes(key));
  };

  const getToolInfoByKey = (key: TToolKey) => {
    return tools.find((tool) => tool.key.includes(key));
  };
  return {
    tools,
    getToolByKey,
    getToolInfoByKey,
  };
};
