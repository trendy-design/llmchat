import { modelService } from "@/lib/services/models";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ToolDefinition, ToolExecutionContext } from "@repo/shared/types";
import { StructuredOutputParser } from "langchain/output_parsers";
import { Brain } from "lucide-react";
import { z } from "zod";

const memoryParser = StructuredOutputParser.fromZodSchema(
  z.object({
    memories: z
      .array(
        z.string().describe("A single piece of key information about the user"),
      )
      .describe("List of key information about the user"),
  }),
);

const memoryToolSchema = z.object({
  memory: z
    .array(
      z.string().describe("A single piece of key information about the user"),
    )
    .describe(
      "New key information about the user or their preferences to be added or updated",
    ),
  question: z.string().describe("The question or request made by the user"),
});

const memoryFunction = (context: ToolExecutionContext) => {
  const {
    apiKeys,
    preferences,
    updatePreferences,
    model,
    updateToolExecutionState,
  } = context;

  return new DynamicStructuredTool({
    name: "memory",
    description:
      "Manages user information and preferences to personalize future interactions. Use when the user provides key information or explicitly asks to remember something.",
    schema: memoryToolSchema,
    func: async ({ memory, question }, runManager) => {
      try {
        const existingMemories = preferences?.memories || [];

        const currentModel = await modelService.createInstance({
          model: model,
          provider: model.provider,
          apiKey: apiKeys.find((key) => key.provider === model.provider)?.key,
        });

        const chain = RunnableSequence.from([
          PromptTemplate.fromTemplate(
            `User request: "{question}"
            New info: {new_memory}
            Existing memories: {existing_memory}
            
            Update memories:
            1. Update existing with new details
            2. Remove if requested
            3. Add new unique memories
            
            {format_instructions}`,
          ),
          currentModel as any,
          memoryParser as any,
        ]);

        const response = await chain.invoke({
          new_memory: memory.join("\n"),
          existing_memory: existingMemories.join("\n"),
          question: question,
          format_instructions: memoryParser.getFormatInstructions(),
        });

        if (!response?.memories?.length) {
          runManager?.handleToolError("Error performing memory update");
          return question;
        }

        updatePreferences?.({
          memories: response.memories,
        });

        updateToolExecutionState({
          toolName: "memory",
          executionArgs: {
            memory,
            question,
          },
          renderData: {
            memories: response.memories,
          },
          executionResult: response,
          isLoading: false,
        });
        return question;
      } catch (error) {
        updateToolExecutionState({
          toolName: "memory",
          executionArgs: {
            memory,
            question,
          },
          isLoading: false,
        });
        return "Error performing memory update. Please check API keys.";
      }
    },
  });
};

const memoryToolDefinition: ToolDefinition = {
  key: "memory",
  description: "Personalize future interactions",
  executionFunction: memoryFunction,
  displayName: "Memory",
  isBeta: false,
  isVisibleInMenu: true,
  validateAvailability: async (context) => {
    return true;
  },

  loadingMessage: "Updating memories...",
  successMessage: "Memories updated successfully",
  icon: Brain,
  compactIcon: Brain,
};

export { memoryToolDefinition };
