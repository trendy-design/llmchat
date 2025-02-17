import { VariantProps, cva } from 'class-variance-authority';
import React from 'react';
import { cn } from '../lib/utils';
const flexVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      rowReverse: 'flex-row-reverse',
      col: 'flex-col',
      colReverse: 'flex-col-reverse',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
      '2xl': 'gap-8',
      '3xl': 'gap-12',
      '4xl': 'gap-16',
      '5xl': 'gap-20',
      '6xl': 'gap-24',
      '7xl': 'gap-28',
      '8xl': 'gap-32',
      '9xl': 'gap-36',
      '10xl': 'gap-40',
    },
    justify: {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
      stretch: 'justify-stretch',
    },
    items: {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    },
  },
  defaultVariants: {
    direction: 'row',
    gap: 'none',
    justify: 'start',
    items: 'start',
  },
});

export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {
  asChild?: boolean;
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, direction, gap, justify, items, asChild = false, ...props }, ref) => {
    return (
      <div
        className={cn(flexVariants({ direction, gap, justify, items, className }))}
        ref={ref}
        {...props}
      >
        {props.children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';
