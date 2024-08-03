import { GeneratedImage } from "@/components/generated-image";
import { SearchResults } from "@/components/tools/search-results";
import { BrainIcon } from "@/components/ui/icons";
import { usePreferenceContext } from "@/context";
import { dalleTool } from "@/tools/dalle";
import { duckduckGoTool } from "@/tools/duckduckgo";
import { googleSearchTool } from "@/tools/google";
import { memoryTool } from "@/tools/memory";
import { readerTool } from "@/tools/reader";
import { TToolConfig, TToolKey } from "@/types";
import { AiImageIcon, Book02Icon, Globe02Icon } from "@hugeicons/react";
import { useRouter } from "next/navigation";

export const useTools = () => {
  const { push } = useRouter();
  const { preferences } = usePreferenceContext();

  const tools: TToolConfig[] = [
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
        push("settings/plugins/web-search");
      },
      renderUI: ({ searchResults, query }) => {
        return <SearchResults searchResults={searchResults} query={query} />;
      },
      loadingMessage:
        preferences?.defaultWebSearchEngine === "google"
          ? "Searching on Google..."
          : "Searching on DuckDuckGo...",
      resultMessage:
        preferences?.defaultWebSearchEngine === "google"
          ? "Results from Google search"
          : "Result from DuckDuckGo search",
      icon: Globe02Icon,
      smallIcon: Globe02Icon,
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
      validationFailedAction: () => {},
      renderUI: ({ image, query }) => {
        return <GeneratedImage image={image} />;
      },
      loadingMessage: "Generating Image ...",
      resultMessage: "Generated Image",
      icon: AiImageIcon,
      smallIcon: AiImageIcon,
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
      loadingMessage: "Saving to the memory...",
      resultMessage: "Saved to the memory",
      icon: BrainIcon,
      smallIcon: BrainIcon,
    },
    {
      key: "webpage_reader",
      description: "Read the webpage and answer the question",
      tool: readerTool,
      name: "Webpage Reader",
      isBeta: true,
      showInMenu: false,
      validate: async () => {
        return true;
      },

      loadingMessage: "Analyzing the webpage...",
      resultMessage: "Analyzed webpage",
      icon: Book02Icon,
      enforceTool: true,
      smallIcon: Book02Icon,
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
