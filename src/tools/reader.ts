import { TToolArg } from "@/types";
import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

const readerTool = (args: TToolArg) => {
  const { sendToolResponse } = args;
  const webSearchSchema = z.object({
    url: z.string().url().describe("URL of the page to be read"),
    question: z.string().describe("Question to be asked to the webpage"),
  });

  return new DynamicStructuredTool({
    name: "webpage_reader",
    description:
      "A tool to read a webpage and extract information from it. Useful for when you need to answer questions about a webpage. Input should be a URL of the page to be read.",
    schema: webSearchSchema,
    func: async ({ url, question }, runManager) => {
      try {
        const readerResults = await axios.post("/api/reader", {
          urls: [url],
        });

        const information = readerResults?.data?.results
          ?.filter((result: any) => !!result?.success)
          ?.map(
            (result: any) => `
          title: ${result?.title},
          markdown: ${result?.markdown},
          url: ${result?.url},
        `,
          );

        const searchPrompt = `Information: \n\n ${information} \n\n Based on snippet please answer the given question with proper citations without using duckduckgo_search function again. Must Remove XML tags if any. Question: ${question}`;
        sendToolResponse({
          toolName: "webpage_reader",
          toolArgs: {
            url,
          },
          toolRenderArgs: {
            url,
            information,
          },
          toolResponse: information,
          toolLoading: false,
        });
        return searchPrompt;
      } catch (error) {
        sendToolResponse({
          toolName: "webpage_reader",
          toolArgs: {
            url,
          },
          toolLoading: false,
        });
        return "Error reading webpage. Must not use webpage_reader tool now. Ask user to check API keys.";
      }
    },
  });
};

export { readerTool };
