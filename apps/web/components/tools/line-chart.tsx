"use client";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { lineChartSchema } from "@/libs/tools/line-chart";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent, Type
} from "@repo/ui";
import { useMemo } from "react";
import { z } from "zod";
import { ErrorBoundary } from "./error-boundary";

const colors = [
  "hsl(var(--color-red-700-value))",
  "hsl(var(--color-green-700-value))",
  "hsl(var(--color-blue-700-value))",
  "hsl(var(--color-amber-700-value))",
  "hsl(var(--color-purple-700-value))",
  "hsl(var(--color-pink-700-value))",
  "hsl(var(--color-teal-700-value))",
];

export type ChartComponentProps = z.infer<typeof lineChartSchema>;

const convertToKey = (label: string) => {
  return label
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/^[^a-z_]/, "_");
};

const trimLabel = (label: string | number, maxLength: number = 5): string => {
  if (typeof label === "number") {
    if (label >= 1e9) return `${(label / 1e9).toFixed(1)}B`;
    if (label >= 1e6) return `${(label / 1e6).toFixed(1)}M`;
    if (label >= 1e3) return `${(label / 1e3).toFixed(1)}K`;
    return label.toLocaleString("en-US", { maximumFractionDigits: 1 });
  }
  return label.length > maxLength ? `${label.slice(0, maxLength)}...` : label;
};

// Error Boundary Component

export function LineChartComponent({
  title,
  xData,
  ySeriesData,
  xLabel,
}: ChartComponentProps) {
  const { combinedData, yAxisMax } = useMemo(() => {
    const xKey = convertToKey(xLabel);

    const combinedData =
      xData?.map((xValue, index) => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const dataPoint: any = {
          [xKey]: xValue,
          trimmedXLabel: trimLabel(xValue),
        };
        // biome-ignore lint/complexity/noForEach: <explanation>
        for (const series of ySeriesData) {
          const yKey = convertToKey(series.label);
          const yValue = series.data[index];
          dataPoint[yKey] = Number.isNaN(yValue) ? 0 : yValue;
          dataPoint[`trimmed_${yKey}`] = trimLabel(Number.isNaN(yValue) ? 0 : yValue);
        }
        return dataPoint;
      }) ?? [];

    const maxYValue = Math.max(
      ...(ySeriesData?.flatMap((series) =>
        series.data.map((value) => Number(value) || 0),
      ) ?? []),
    );
    const yAxisMax = maxYValue ? Math.ceil(maxYValue * 1.1) : 10;

    return { combinedData, yAxisMax };
  }, [xData, ySeriesData, xLabel]);

  return (
    <ErrorBoundary fallbackError="Something went wrong. Can't display chart.">
      <div className="w-full rounded-lg bg-zinc-500/5 p-4">
        <Type size="sm" weight="medium">
          {title}
        </Type>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={combinedData}
            width={400}
            height={300}
            margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="trimmedXLabel" angle={45} textAnchor="start" />
            <YAxis
              domain={[0, yAxisMax]}
              tickFormatter={(value) => trimLabel(value)}
            />
            <ChartLegend margin={{ top: 100 }} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {ySeriesData?.map((series, index) => (
              <Line
                key={series.label}
                dataKey={convertToKey(series.label)}
                name={series.label}
                type="monotone"
                stroke={series?.fill || colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </div>
    </ErrorBoundary>
  );
}
