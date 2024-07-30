import { TToolArg } from "@/types";
import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

const googleSearchTool = (args: TToolArg) => {
  const { preferences, sendToolResponse } = args;
  const webSearchSchema = z.object({
    input: z.string(),
  });

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

        const searchPrompt = `Answer the following question based on the information provided. if required use the link to get more information. Question: ${input} \n\n Information: \n\n ${information}`;

        sendToolResponse({
          toolName: "web_search",
          toolArgs: {
            input,
          },
          toolRenderArgs: {
            query: input,
            searchResults: googleSearchResult?.map((result: any) => ({
              title: result?.title,
              snippet: result?.snippet,
              link: result?.link,
            })),
          },
          toolResponse: googleSearchResult,
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
        return "Error performing Google search. Ask user to check API keys.";
      }
    },
  });
};

export { googleSearchTool };
