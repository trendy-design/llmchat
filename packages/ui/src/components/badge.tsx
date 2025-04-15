import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/utils';

const badgeVariants = cva(
    'flex items-center whitespace-nowrap gap-1.5 rounded-sm px-2 py-0.5 text-[0.7rem] font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-tertiary text-foreground rounded-md',
                secondary: 'bg-tertiary text-tertiary-foreground rounded-full',
                tertiary: 'bg-brand text-brand-foreground rounded-full',
                brand: 'bg-brand text-brand-foreground',
                destructive: 'bg-destructive text-destructive-foreground',
                outline: 'border border-input bg-background text-foreground',
            },
            size: {
                sm: 'px-2 h-5 text-xs',
                md: 'px-2 h-6 text-xs font-mono text-[11px] tracking-[0.02em] font-[350]',
                lg: 'px-3  h-7 text-xs',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {
    size?: 'sm' | 'md' | 'lg';
}

function Badge({ className, variant, size, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
