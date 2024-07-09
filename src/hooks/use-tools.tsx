import { usePreferenceContext, useSettingsContext } from "@/context";
import { dalleTool } from "@/tools/dalle";
import { duckduckGoTool } from "@/tools/duckduckgo";
import { googleSearchTool } from "@/tools/google";
import { memoryTool } from "@/tools/memory";
import {
  BrainIcon,
  GlobalSearchIcon,
  HugeiconsProps,
  Image01Icon,
} from "@hugeicons/react";
import { FC, ReactNode, RefAttributes } from "react";
import { TApiKeys, TPreferences, TToolResponse } from ".";

export const toolKeys = ["calculator", "web_search"];

export type TToolArg = {
  updatePreferences: ReturnType<
    typeof usePreferenceContext
  >["updatePreferences"];
  preferences: TPreferences;
  apiKeys: TApiKeys;
  sendToolResponse: (response: TToolResponse) => void;
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
  smallIcon: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>;
};

interface DataEntry {
  label: string;
  name: string;
  values: number;
}

interface GroupedData {
  [key: string]: DataEntry[];
}

const getLabels = (data: DataEntry[]): string[] => {
  return data.reduce((acc: string[], entry: DataEntry) => {
    if (!acc.includes(entry.label)) {
      return [...acc, entry.label];
    }
    return acc;
  }, []);
};

const getData = (data: DataEntry[], labels: string[]): string[] => {
  return data.reduce((acc: string[], entry: DataEntry) => {
    if (!acc.includes(entry.name)) {
      return [...acc, entry.name];
    }
    return acc;
  }, []);
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
      smallIcon: GlobalSearchIcon,
    },
    {
      key: "image_generation",
      description: "Generate images",
      tool: dalleTool,
      name: "Image Generation",
      isBeta: true,
      showInMenu: true,
      validate: async () => {
        return true;
      },
      validationFailedAction: () => {
        open("web-search");
      },
      renderUI: ({ image }) => {
        return (
          <img
            src={image}
            alt=""
            className="w-[400px] h-[400px] rounded-2xl border"
          />
        );
      },
      loadingMessage: "Generating Image ...",
      resultMessage: "Generated Image",
      icon: Image01Icon,
      smallIcon: Image01Icon,
    },
    {
      key: "memory",
      description: "AI will remeber things about you",
      tool: memoryTool,
      name: "Memory",
      isBeta: true,
      showInMenu: true,
      validate: async () => {
        return true;
      },
      validationFailedAction: () => {
        open("web-search");
      },
      renderUI: ({ image }) => {
        return (
          <img
            src={image}
            alt=""
            className="w-[400px] h-[400px] rounded-2xl border"
          />
        );
      },
      loadingMessage: "Saving to the memory...",
      resultMessage: "Updated memory",
      icon: BrainIcon,
      smallIcon: BrainIcon,
    },
    // {
    //   key: "chart",
    //   description: "Genrate Chart",
    //   tool: chartTool,
    //   name: "Chart",
    //   isBeta: true,
    //   showInMenu: true,

    //   validate: async () => {
    //     return true;
    //   },
    //   validationFailedAction: () => {
    //     open("web-search");
    //   },

    //   loadingMessage: "Generating chart...",
    //   resultMessage: "Generated Chart",
    //   icon: PieChartIcon,
    //   smallIcon: PieChartIcon,
    // },
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
