import * as React from 'react';

import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '../lib/utils';
const inputVariants = cva(
    'flex h-9 w-full rounded-xl bg-background shadow-subtle-xs outline-none  px-3 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-background text-sm',
                ghost: 'bg-transparent',
            },
            size: {
                default: 'h-9 px-4 text-sm',
                sm: 'h-9 px-3 text-xs md:text-sm',
            },
            rounded: {
                default: 'rounded-md',
                lg: 'rounded-lg',
                full: 'rounded-full',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            rounded: 'default',
        },
    }
);

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
        VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, variant, size, rounded, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(inputVariants({ variant, size, rounded, className }))}
                ref={ref}
                autoComplete="off"
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export { Input };
