import { webPageReaderPrompt } from "@/config/prompts";
import { ToolDefinition, ToolExecutionContext } from "@/types";
import { Book01Icon } from "@hugeicons/react";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import axios from "axios";
import { z } from "zod";

const webSearchSchema = z.object({
  url: z.string().url().describe("URL of the page to be read"),
  question: z.string().describe("Question to be asked to the webpage"),
});

const readerFunction = (context: ToolExecutionContext) => {
  const { updateToolExecutionState } = context;

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

            return `title: ${result?.title},markdown: ${chunks?.[0]?.pageContent},url: ${result?.url}`;
          }),
        );

        const searchPrompt = `Information: \n\n ${information.join("\n\n")} \n\n Based on the information please answer the given question with proper citations. Question: ${question}`;
        updateToolExecutionState({
          toolName: "webpage_reader",
          executionArgs: {
            url,
          },
          renderData: {
            url,
            information,
          },
          executionResult: information,
          isLoading: false,
        });
        return searchPrompt;
      } catch (error) {
        updateToolExecutionState({
          toolName: "webpage_reader",
          executionArgs: {
            url,
          },
          isLoading: false,
        });
        return "Error reading webpage. Must not use webpage_reader tool now. Ask user to check API keys.";
      }
    },
  });
};

const readerToolDefinition: ToolDefinition = {
  key: "webpage_reader",
  description: "Read and analyze web pages",
  executionFunction: readerFunction,
  displayName: "Web Page Reader",
  isBeta: false,
  isVisibleInMenu: false,
  validateAvailability: async (context) => {
    return true;
  },
  loadingMessage: "Reading webpage...",
  successMessage: "Webpage read successfully",
  icon: Book01Icon,
  compactIcon: Book01Icon,
};

export { readerToolDefinition };
