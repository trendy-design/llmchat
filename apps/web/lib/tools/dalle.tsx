import { GeneratedImage } from "@/components/generated-image";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { DallEAPIWrapper } from "@langchain/openai";
import { ToolDefinition, ToolExecutionContext } from "@repo/shared/types";
import { ImageIcon } from "lucide-react";
import { z } from "zod";

const dalleInputSchema = z.object({
  imageDescription: z.string(),
});

const dalleFunction = (context: ToolExecutionContext) => {
  const { apiKeys, updateToolExecutionState, preferences } = context;

  return new DynamicStructuredTool({
    name: "image_generation",
    description: "Useful for when you asked for image based on description.",
    schema: dalleInputSchema,

    func: async ({ imageDescription }, runManager) => {
      try {
        const tool = new DallEAPIWrapper({
          n: 1,
          model: "dall-e-3",
          apiKey: apiKeys.find((key) => key.provider === "openai")?.key,
          quality: preferences.dalleImageQuality,
          size: preferences.dalleImageSize,
        });

        const result = await tool.invoke(imageDescription);
        if (!result) {
          runManager?.handleToolError("Error performing Duckduck go search");
          throw new Error("Invalid response");
        }

        updateToolExecutionState({
          toolName: "image_generation",
          executionArgs: {
            imageDescription,
          },
          renderData: {
            image: result,
            query: imageDescription,
          },
          executionResult: result,
          isLoading: false,
        });
        const searchPrompt =
          "Only generate one image. Do not generate multiple images. and describe the image in detail.";
        return searchPrompt;
      } catch (error) {
        updateToolExecutionState({
          toolName: "image_generation",
          executionArgs: {
            imageDescription,
          },
          isLoading: false,
        });
        return "Error performing search. Must not use duckduckgo_search tool now. Ask user to check API keys.";
      }
    },
  });
};

const dalleToolDefinition: ToolDefinition = {
  key: "image_generation",
  description: "Generate images",
  executionFunction: dalleFunction,
  displayName: "Image Generation",
  isBeta: true,
  isVisibleInMenu: true,
  validateAvailability: async () => Promise.resolve(true),
  renderComponent: ({ image, query }) => {
    return <GeneratedImage image={image} />;
  },
  loadingMessage: "Generating Image ...",
  successMessage: "Generated Image",
  icon: ImageIcon,
  compactIcon: ImageIcon,
};

export { dalleToolDefinition };
