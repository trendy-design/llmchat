import { SearchResults } from "@/components/tools/search-results";
import { duckDuckGoSearchPropmt, duckDuckGoToolPrompt } from "@/config/prompts";
import { ToolDefinition, ToolExecutionContext } from "@/types";
import { Globe02Icon } from "@hugeicons/react";
import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

const webSearchSchema = z.object({
  input: z.string(),
});

const duckduckGoFunction = (context: ToolExecutionContext) => {
  const { updateToolExecutionState } = context;

  return new DynamicStructuredTool({
    name: "web_search",
    description: duckDuckGoToolPrompt,
    schema: webSearchSchema,
    func: async ({ input }, runManager) => {
      try {
        const response = await axios.post("/api/search", { query: input });
        const result = JSON?.parse(response.data?.results) || [];
        if (!result) {
          runManager?.handleToolError("Error performing Duckduck go search");
          throw new Error("Invalid response");
        }

        const information = result?.map(
          (result: any) => `
          title: ${result?.title},
          snippet: ${result?.snippet},
          link: ${result?.link}
        `,
        );

        updateToolExecutionState({
          toolName: "web_search",
          executionArgs: {
            input,
          },
          renderData: {
            query: input,
            searchResults: result?.map((result: any) => ({
              title: result?.title,
              snippet: result?.snippet,
              link: result?.link,
            })),
          },
          executionResult: result,
          isLoading: false,
        });
        return duckDuckGoSearchPropmt(input, information);
      } catch (error) {
        updateToolExecutionState({
          toolName: "web_search",
          executionArgs: {
            input,
          },
          isLoading: false,
        });
        return "Error performing search. Must not use duckduckgo_search tool now. Ask user to check API keys.";
      }
    },
  });
};

const duckduckGoToolDefinition: ToolDefinition = {
  key: "web_search",
  description: "Search on DuckDuckGo",
  executionFunction: duckduckGoFunction,
  displayName: "Web Search",
  isBeta: true,
  isVisibleInMenu: true,
  validateAvailability: async () => Promise.resolve(true),
  renderComponent: ({ searchResults, query }) => {
    return <SearchResults searchResults={searchResults} query={query} />;
  },
  loadingMessage: "Searching on DuckDuckGo...",
  successMessage: "Results from DuckDuckGo search",
  icon: Globe02Icon,
  compactIcon: Globe02Icon,
};

export { duckduckGoToolDefinition };
