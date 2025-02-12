import { BarChartComponent } from "@/components/tools/bar-chart";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ToolDefinition, ToolExecutionContext } from "@repo/shared/types";
import { BarChart } from "lucide-react";
import { z } from "zod";

export const barChartSchema = z.object({
  title: z.string().optional().describe("Title of the chart"),
  xData: z.array(z.string()).describe("X-axis values"),
  xLabel: z.string().describe("Label for the X-axis"),
  yData: z
    .array(
      z.object({
        label: z.string().describe("Label for this set of Y-axis values"),
        data: z.array(z.number()).describe("Y-axis values for this set"),
        fill: z.string().optional().describe("Fill color if asked for"),
      }),
    )
    .describe("Multiple sets of Y-axis data"),
  yLabel: z.string().describe("Label for the Y-axis"),
});

const barChartFunction = (context: ToolExecutionContext) => {
  const { updateToolExecutionState } = context;

  return new DynamicStructuredTool({
    name: "bar_chart",
    description:
      "Generate a bar chart with multiple data sets from provided data",
    schema: barChartSchema,
    func: async ({ title, xData, xLabel, yData, yLabel }, runManager) => {
      try {
        updateToolExecutionState({
          toolName: "bar_chart",
          executionArgs: {
            title,
            xData,
            yData,
            xLabel,
            yLabel,
          },
          renderData: {
            title,
            xData,
            yData,
            xLabel,
            yLabel,
          },
          executionResult: { success: true },
          isLoading: false,
        });
        return `Just explain the chart in a simple way based on the data provided. {xData: ${xData}, yData: ${JSON.stringify(yData)}, xLabel: ${xLabel}, yLabel: ${yLabel}}`;
      } catch (error: any) {
        console.error("Chart generation error:", error);
        updateToolExecutionState({
          toolName: "bar_chart",
          executionArgs: {
            title,
            xData,
            yData,
            xLabel,
            yLabel,
          },
          isLoading: false,
        });
        return `Error generating chart: ${error.toString()}`;
      }
    },
  });
};

const barChartToolDefinition: ToolDefinition = {
  key: "bar_chart",
  description: "Generate Data Visualizations",
  executionFunction: barChartFunction,
  displayName: "Bar Chart",
  isBeta: false,
  isVisibleInMenu: true,
  validateAvailability: async () => Promise.resolve(true),
  renderComponent: ({ title, xData, yData, xLabel, yLabel }) => {
    return (
      <BarChartComponent
        title={title}
        xData={xData}
        yData={yData}
        xLabel={xLabel}
        yLabel={yLabel}
      />
    );
  },
  loadingMessage: "Generating Bar Chart...",
  successMessage: "Bar Chart Generated",
  icon: BarChart,
  compactIcon: BarChart,
};

export { barChartToolDefinition };
