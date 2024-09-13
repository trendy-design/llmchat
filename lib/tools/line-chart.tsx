import { LineChartComponent } from "@/components/tools/line-chart";
import { ToolDefinition, ToolExecutionContext } from "@/lib/types";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { LineChart } from "lucide-react";
import { z } from "zod";

export const lineChartSchema = z.object({
  title: z.string().optional().describe("Title of the chart"),
  xData: z.array(z.string()).describe("X-axis values"),
  xLabel: z.string().describe("Label for the X-axis"),
  ySeriesData: z
    .array(
      z.object({
        label: z.string().describe("Label for this data series"),
        data: z.array(z.number()).describe("Y-axis values for this series"),
        fill: z.string().optional().describe("fill color if asked for"),
      }),
    )
    .describe("Multiple Y-axis data series"),
});

const lineChartFunction = (context: ToolExecutionContext) => {
  const { updateToolExecutionState } = context;

  return new DynamicStructuredTool({
    name: "line_chart",
    description: "Generate a multi-line chart from provided data",
    schema: lineChartSchema,
    func: async ({ title, xData, xLabel, ySeriesData }, runManager) => {
      try {
        updateToolExecutionState({
          toolName: "line_chart",
          executionArgs: {
            title,
            xData,
            ySeriesData,
            xLabel,
          },
          renderData: {
            title,
            xData,
            ySeriesData,
            xLabel,
          },
          executionResult: { success: true },
          isLoading: false,
        });
        return `Just explain the multi-line chart in a simple way based on the data provided. {xData: ${xData}, ySeriesData: ${JSON.stringify(ySeriesData)}, xLabel: ${xLabel}}`;
      } catch (error: any) {
        console.error("Chart generation error:", error);
        updateToolExecutionState({
          toolName: "line_chart",
          executionArgs: {
            title,
            xData,
            ySeriesData,
            xLabel,
          },
          isLoading: false,
        });
        return `Error generating chart: ${error.toString()}`;
      }
    },
  });
};

const lineChartToolDefinition: ToolDefinition = {
  key: "line_chart",
  description: "Generate Line Chart Visualizations",
  executionFunction: lineChartFunction,
  displayName: "Line Chart",
  isBeta: false,
  isVisibleInMenu: true,
  validateAvailability: async () => Promise.resolve(true),
  renderComponent: ({ title, xData, ySeriesData, xLabel }) => {
    return (
      <LineChartComponent
        title={title}
        xData={xData}
        ySeriesData={ySeriesData}
        xLabel={xLabel}
      />
    );
  },
  loadingMessage: "Generating Line Chart...",
  successMessage: "Line Chart Generated",
  icon: LineChart,
  compactIcon: LineChart,
};

export { lineChartToolDefinition };
