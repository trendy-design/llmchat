import { modelService } from "@/services/models";
import { ToolDefinition, ToolExecutionContext } from "@/types";
import { BrainIcon } from "@hugeicons/react";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

const memoryParser = StructuredOutputParser.fromZodSchema(
  z.object({
    memories: z
      .array(z.string().describe("key information point"))
      .describe("list of key informations"),
  }),
);

const memoryToolSchema = z.object({
  memory: z
    .array(z.string().describe("key information"))
    .describe(
      "key informations about the user, any user preference to personalize future interactions.",
    ),
  question: z.string().describe("question user asked"),
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
      "Useful when user gives key information, preferences about them for personalize future interactions. user could specifically asked to remember something.",
    schema: memoryToolSchema,
    func: async ({ memory, question }, runManager) => {
      try {
        const existingMemories = preferences?.memories || [];

        const currentModel = await modelService.createInstance({
          model: model,
          provider: model.provider,
          apiKey: apiKeys.openai,
        });

        const chain = RunnableSequence.from([
          PromptTemplate.fromTemplate(
            `User's request: "{question}"
            New information: {new_memory}
            Existing memories: {existing_memory}
            
            Update, delete, or add memories based on the new information:
            1. Update existing memories with new details.
            2. Delete memories if requested.
            3. Add new memories if they are unique.
            
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
  description: "Update and manage user memories",
  executionFunction: memoryFunction,
  displayName: "Memory",
  isBeta: false,
  isVisibleInMenu: true,
  validateAvailability: async (context) => {
    return true;
  },

  loadingMessage: "Updating memories...",
  successMessage: "Memories updated successfully",
  icon: BrainIcon,
  compactIcon: BrainIcon,
};

export { memoryToolDefinition };
