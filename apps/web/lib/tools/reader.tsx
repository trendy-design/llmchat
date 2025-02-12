import { DynamicStructuredTool } from "@langchain/core/tools";
import { ToolDefinition, ToolExecutionContext } from "@repo/shared/types";
import axios from "axios";
import { Book } from "lucide-react";
import { z } from "zod";

const webSearchSchema = z.object({
  url: z.string().url().describe("URL of the page to be read"),
});

const readerFunction = (context: ToolExecutionContext) => {
  const { updateToolExecutionState } = context;

  return new DynamicStructuredTool({
    name: "webpage_reader",
    description: "Read the content of a web page via its URL.",
    schema: webSearchSchema,
    func: async ({ url }, runManager) => {
      try {
        const readerResults = await axios.post("/api/reader", {
          urls: [url],
        });

        const results = readerResults?.data?.results?.filter(
          (result: any) => !!result?.success,
        );

        const information = await Promise.all(
          results?.map((result: any) => {
            const truncatedMarkdown = result?.markdown
              .split(" ")
              .slice(0, 3000)
              .join(" ");
            return `title: ${result?.title},markdown: ${truncatedMarkdown},url: ${result?.url}`;
          }),
        );

        const searchPrompt = `summarize the information in a concise manner\n\n ${information.join("\n\n")}`;
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
        return "I apologize, but I encountered an error while performing the web search. This could be due to network issues or API key problems. Please try again later or contact support if the issue persists. In the meantime, I'll do my best to answer your question based on my existing knowledge.";
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
  isVisibleInMenu: true,
  validateAvailability: async (context) => {
    return true;
  },
  loadingMessage: "Reading webpage...",
  successMessage: "Webpage read successfully",
  icon: Book,
  compactIcon: Book,
};

export { readerToolDefinition };
