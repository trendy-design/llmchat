"use client";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { barChartSchema } from "@/libs/tools/bar-chart";
import { Type } from "@/ui";
import { z } from "zod";
import { ErrorBoundary } from "./error-boundary";

export const colors = [
  "hsl(var(--color-red-700-value))",
  "hsl(var(--color-green-700-value))",
  "hsl(var(--color-blue-700-value))",
  "hsl(var(--color-amber-700-value))",
  "hsl(var(--color-purple-700-value))",
  "hsl(var(--color-pink-700-value))",
  "hsl(var(--color-teal-700-value))",
];

export type ChartComponentProps = z.infer<typeof barChartSchema>;

const convertToKey = (label: string) => {
  return label
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/^[^a-z_]/, "_");
};

const trimLabel = (label: string | number, maxLength: number = 5): string => {
  if (typeof label === "number") {
    if (label >= 1e9) return (label / 1e9).toFixed(1) + "B";
    if (label >= 1e6) return (label / 1e6).toFixed(1) + "M";
    if (label >= 1e3) return (label / 1e3).toFixed(1) + "K";
    return label.toLocaleString("en-US", { maximumFractionDigits: 1 });
  }
  return label.length > maxLength ? label.slice(0, maxLength) + "..." : label;
};

// Error Boundary Component

export function BarChartComponent({
  title,
  xData,
  yData,
  xLabel,
  yLabel,
}: ChartComponentProps) {
  const { combinedData, yAxisMax } = useMemo(() => {
    const xKey = convertToKey(xLabel);
    const combinedData = xData?.map((xValue, index) => {
      const dataPoint: any = {
        [xKey]: xValue,
        trimmedXLabel: trimLabel(xValue),
      };
      yData?.forEach((ySet) => {
        const yKey = convertToKey(ySet.label);
        const numericYValue = Number(ySet.data[index]);
        dataPoint[yKey] = isNaN(numericYValue) ? 0 : numericYValue;
        dataPoint[`trimmed_${yKey}`] = trimLabel(dataPoint[yKey]);
      });
      return dataPoint;
    });

    const maxYValue = Math.max(
      ...(yData?.flatMap((ySet) =>
        ySet.data.map((value) => Number(value) || 0),
      ) ?? []),
    );
    const yAxisMax = maxYValue ? Math.ceil(maxYValue * 1.1) : 10;

    return { combinedData, yAxisMax };
  }, [xData, yData, xLabel]);

  return (
    <ErrorBoundary fallbackError="Something went wrong. Can't display chart.">
      <div className="w-full rounded-lg bg-zinc-500/5 p-4">
        <Type size="sm" weight="medium">
          {title}
        </Type>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={combinedData}
            width={400}
            height={300}
            margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="trimmedXLabel" angle={45} textAnchor="start" />
            <YAxis
              {...(yAxisMax ? { domain: [0, yAxisMax] } : {})}
              tickFormatter={(value) => trimLabel(value)}
            />
            <ChartLegend margin={{ top: 100 }} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {yData?.map((ySet, index) => (
              <Bar
                key={ySet.label}
                dataKey={convertToKey(ySet.label)}
                fill={ySet?.fill || colors[index % colors.length]}
                radius={4}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </div>
    </ErrorBoundary>
  );
}
