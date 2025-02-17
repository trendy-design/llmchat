'use client';
import { useMemo } from 'react';
import { Legend, Pie, PieChart } from 'recharts';

import { pieChartSchema } from '@/libs/tools/pie-chart';
import { ChartContainer, ChartTooltip, ChartTooltipContent, Type } from '@repo/ui';
import { z } from 'zod';
import { ErrorBoundary } from './error-boundary';

export type ChartComponentProps = z.infer<typeof pieChartSchema>;

const colors = [
  'hsl(var(--color-red-600-value))',
  'hsl(var(--color-blue-600-value))',
  'hsl(var(--color-amber-600-value))',
  'hsl(var(--color-purple-600-value))',
  'hsl(var(--color-pink-600-value))',
  'hsl(var(--color-teal-600-value))',
];

export function PieChartComponent({ values, labels, title }: ChartComponentProps) {
  const combinedData = useMemo(
    () =>
      values?.map((value, index) => ({
        key: labels?.[index],
        value: value,
        fill: colors[index % colors.length],
      })) ?? [],
    [values, labels]
  );

  return (
    <ErrorBoundary fallbackError="Something went wrong. Can't display chart.">
      <div className="w-full rounded-lg bg-zinc-500/5 p-4">
        <Type size="sm" weight="medium">
          {title}
        </Type>
        <ChartContainer config={{}} className="max-h-[350px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Legend layout="vertical" align="left" verticalAlign="middle" />

            <Pie
              data={combinedData}
              dataKey="value"
              nameKey="key"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
      </div>
    </ErrorBoundary>
  );
}
