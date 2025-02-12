import { SearchResults } from "@/components/tools/search-results";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ToolDefinition, ToolExecutionContext } from "@repo/shared/types";
import axios from "axios";
import { Globe } from "lucide-react";
import { z } from "zod";

const duckDuckGoToolPrompt =
  "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events. Input should be a search query. Don't use tool if already used it to answer the question.";

const duckDuckGoSearchPropmt = (input: string, information: string) =>
  `Answer the following question from the information provided. Question: ${input} \n\n Information: \n\n ${information}`;

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
        return "I apologize, but I encountered an error while performing the web search. This could be due to network issues or API key problems. Please try again later or contact support if the issue persists. In the meantime, I'll do my best to answer your question based on my existing knowledge.";
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
  loadingMessage: "Searching on web...",
  successMessage: "Web Search Results",
  icon: Globe,
  compactIcon: Globe,
};

export { duckduckGoToolDefinition };
