import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'flex items-center whitespace-nowrap rounded-sm px-2 py-0.5 min-h-2 text-[0.7rem] font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-tertiary text-tertiary-foreground rounded-full',
        secondary: 'bg-tertiary text-tertiary-foreground rounded-full',
        tertiary: 'bg-brand text-brand-foreground rounded-full',
        brand: 'bg-brand text-brand-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
