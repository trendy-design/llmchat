import { PieChartComponent } from '@/components/tools/pie-chart';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { ToolDefinition, ToolExecutionContext } from '@repo/shared/types';
import { PieChart } from 'lucide-react';
import { z } from 'zod';

// Simplified schema for pie chart data
export const pieChartSchema = z.object({
  title: z.string().optional().describe('Title of the pie chart'),
  labels: z.array(z.string()).describe('Labels for pie chart segments'),
  values: z.array(z.number()).describe('Values for pie chart segments'),
});

const pieChartFunction = (context: ToolExecutionContext) => {
  const { updateToolExecutionState } = context;

  return new DynamicStructuredTool({
    name: 'pie_chart',
    description: 'Generate a simple pie chart from provided data',
    schema: pieChartSchema,
    func: async ({ labels, values, title }, runManager) => {
      try {
        updateToolExecutionState({
          toolName: 'pie_chart',
          executionArgs: { labels, values, title },
          renderData: { labels, values, title },
          executionResult: { success: true },
          isLoading: false,
        });
        return `Just explain the chart in a simple way from this data: ${JSON.stringify({ labels, values, title })}`;
      } catch (error: any) {
        console.error('Pie chart generation error:', error);
        updateToolExecutionState({
          toolName: 'pie_chart',
          executionArgs: { labels, values, title },
          isLoading: false,
        });
        return `Error generating pie chart: ${error.toString()}`;
      }
    },
  });
};

const pieChartToolDefinition: ToolDefinition = {
  key: 'pie_chart',
  description: 'Generate Pie Chart Visualization',
  executionFunction: pieChartFunction,
  displayName: 'Pie Chart',
  isBeta: false,
  isVisibleInMenu: true,
  validateAvailability: async () => Promise.resolve(true),
  renderComponent: ({ labels, values, title }) => {
    return <PieChartComponent labels={labels} values={values} title={title} />;
  },
  loadingMessage: 'Generating Pie Chart...',
  successMessage: 'Pie Chart Generated',
  icon: PieChart,
  compactIcon: PieChart,
};

export { pieChartToolDefinition };
