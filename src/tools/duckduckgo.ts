import { TToolArg } from "@/types";
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

        const searchPrompt = `Answer the following question based on the information provided. if required use the link to get more information. Question: ${input} \n\n Information: \n\n ${information}`;
        sendToolResponse({
          toolName: "web_search",
          toolArgs: {
            input,
          },
          toolRenderArgs: {
            query: input,
            searchResults: result?.map((result: any) => ({
              title: result?.title,
              snippet: result?.snippet,
              link: result?.link,
            })),
          },
          toolResponse: result,
          toolLoading: false,
        });
        return searchPrompt;
      } catch (error) {
        sendToolResponse({
          toolName: "web_search",
          toolArgs: {
            input,
          },
          toolLoading: false,
        });
        return "Error performing search. Must not use duckduckgo_search tool now. Ask user to check API keys.";
      }
    },
  });
};

export { duckduckGoTool };
