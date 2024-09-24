import { SearchResults } from "@/components/tools/search-results";
import { googleSearchPrompt } from "@/config/prompts";
import { ToolDefinition, ToolExecutionContext } from "@/lib/types";
import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from "axios";
import { Globe } from "lucide-react";
import { z } from "zod";

const webSearchSchema = z.object({
  input: z.string(),
});

const googleSearchFunction = (context: ToolExecutionContext) => {
  const { preferences, updateToolExecutionState } = context;

  return new DynamicStructuredTool({
    name: "web_search",
    description:
      "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events. Input should be a search query. Don't use tool if already used it to answer the question.",
    schema: webSearchSchema,
    func: async ({ input }, runManager) => {
      const url = "https://www.googleapis.com/customsearch/v1";
      const params = {
        key: preferences.googleSearchApiKey,
        cx: preferences.googleSearchEngineId,
        q: input,
      };

      try {
        const response = await axios.get(url, { params });

        if (response.status !== 200) {
          runManager?.handleToolError("Error performing Google search");
          throw new Error("Invalid response");
        }
        const googleSearchResult = response?.data?.items
          ?.slice(0, 5)
          ?.map((item: any) => ({
            title: item.title,
            snippet: item.snippet,
            link: item.link,
          }));

        const information = googleSearchResult?.map(
          (result: any) => `
            title: ${result?.title},
            markdown: ${result?.snippet},
            url: ${result?.link},
          `,
        );

        updateToolExecutionState({
          toolName: "web_search",
          executionArgs: {
            input,
          },
          renderData: {
            query: input,
            searchResults: googleSearchResult?.map((result: any) => ({
              title: result?.title,
              snippet: result?.snippet,
              link: result?.link,
            })),
          },
          executionResult: googleSearchResult,
          isLoading: false,
        });
        return googleSearchPrompt(input, information);
      } catch (error) {
        updateToolExecutionState({
          toolName: "web_search",
          executionArgs: {
            input,
          },
          isLoading: false,
        });
        return "I apologize, but I encountered an error while performing the web search. This could be due to network issues or API key problems. Please try again later or contact support if the issue persists. In the meantime, I'll do my best to answer your question based on my existing knowledge.";
      }
    },
  });
};

const googleSearchToolDefinition: ToolDefinition = {
  key: "web_search",
  description: "Search on Google",
  executionFunction: googleSearchFunction,
  displayName: "Web Search",
  isBeta: true,
  isVisibleInMenu: true,
  validateAvailability: async (context) => {
    return !!(
      context?.preferences?.googleSearchApiKey &&
      context?.preferences?.googleSearchEngineId
    );
  },
  renderComponent: ({ searchResults, query }) => {
    return <SearchResults searchResults={searchResults} query={query} />;
  },
  loadingMessage: "Searching on web...",
  successMessage: "Web Search Results",
  icon: Globe,
  compactIcon: Globe,
};

export { googleSearchToolDefinition };
