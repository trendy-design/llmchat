import { TToolArg } from "@/types";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const chartTool = (args: TToolArg) => {
  const { apiKeys, sendToolResponse, preferences, updatePreferences } = args;
  const chartSchema = z.object({
    // An array of data points, where each data point is an object
    dataPoints: z
      .array(
        z
          .object({
            // The label associated with the data point (e.g., category or group name)
            label: z
              .string()
              .describe(
                "The label associated with the data point, such as a category or group name."
              ),

            // The name of the data point (e.g., a specific metric or item within the category)
            name: z
              .string()
              .describe(
                "The specific name of the data point, representing a particular metric or item within the label's category."
              ),

            // The value of the data point (e.g., the numerical value associated with the name)
            values: z
              .number()
              .describe(
                "The numerical value associated with the data point's name."
              ),
          })
          .describe(
            "An individual data point object, containing a label, name, and value."
          )
      )
      .describe(
        "An array of data point objects, each representing a specific metric or item within a category."
      ),
  });

  return new DynamicStructuredTool({
    name: "chart",
    description: "Useful when you want to generate bar chart.",
    schema: chartSchema,
    func: async ({ dataPoints }, runManager) => {
      try {
        console.log("djn", dataPoints);

        sendToolResponse({
          toolName: "memory",
          toolArgs: {
            dataPoints,
          },
          toolRenderArgs: {
            dataPoints,
          },
          toolResponse: "",
        });
        return "";
      } catch (error) {
        return "Error performing search. Must not use duckduckgo_search tool now. Ask user to check API keys.";
      }
    },
  });
};

export { chartTool };
