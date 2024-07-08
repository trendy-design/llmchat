import { TToolArg } from "@/hooks";
import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

const duckduckGoTool = (args: TToolArg) => {
  const { sendToolResponse } = args;
  const webSearchSchema = z.object({
    input: z.string(),
  });

  return new DynamicStructuredTool({
    name: "web_search",
    description:
      "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events. Input should be a search query. Don't use tool if already used it to answer the question.",
    schema: webSearchSchema,
    func: async ({ input }, runManager) => {
      try {
        const response = await axios.post("/api/search", { query: input });
        const result = response.data?.results;
        if (!result) {
          runManager?.handleToolError("Error performing Duckduck go search");
          throw new Error("Invalid response");
        }
        const searchPrompt = `Information: \n\n ${result} \n\n Based on snippet please answer the given question with proper citations without using duckduckgo_search function again. Must Remove XML tags if any. Question: ${input}`;
        sendToolResponse({
          toolName: "web_search",
          toolArgs: {
            input,
          },
          toolRenderArgs: {
            searchResult: result,
          },
          toolResponse: result,
        });
        return searchPrompt;
      } catch (error) {
        return "Error performing search. Must not use duckduckgo_search tool now. Ask user to check API keys.";
      }
    },
  });
};

export { duckduckGoTool };
