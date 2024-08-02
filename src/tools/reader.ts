import { webPageReaderPrompt } from "@/config/prompts";
import { TToolArg } from "@/types";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
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
    description: webPageReaderPrompt,
    schema: webSearchSchema,
    func: async ({ url, question }, runManager) => {
      try {
        const readerResults = await axios.post("/api/reader", {
          urls: [url],
        });

        const results = readerResults?.data?.results?.filter(
          (result: any) => !!result?.success,
        );

        const information = await Promise.all(
          results?.map(async (result: any) => {
            const textSplitter = new RecursiveCharacterTextSplitter({
              chunkSize: 4000,
              chunkOverlap: 200,
              separators: ["\n\n"],
            });

            const chunks = await textSplitter.createDocuments([
              result?.markdown,
            ]);
            console.log("chunks", chunks?.[0]?.pageContent?.length);

            console.log("rawchunks", result?.markdown?.length);

            return `title: ${result?.title},markdown: ${chunks?.[0]?.pageContent},url: ${result?.url}`;
          }),
        );

        const searchPrompt = `Information: \n\n ${information.join("\n\n")} \n\n Based on the information please answer the given question with  proper citations. Question: ${question}`;
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
        console.log("error", error);
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
