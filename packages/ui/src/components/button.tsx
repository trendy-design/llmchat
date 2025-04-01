import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { type LucideIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/utils';
import { Tooltip } from './tooltip';

const buttonVariants = cva(
    'inline-flex items-center gap-2 justify-center font-medium whitespace-nowrap rounded-xl transition-colors focus-visible:outline-none [&>svg]:text-muted-foreground disabled:opacity-70',
    {
        variants: {
            variant: {
                default:
                    'bg-emerald-700 border border-emerald-800 text-background [&>svg]:text-background font-semibold hover:opacity-90',
                brand: 'bg-brand text-brand-foreground font-semibold hover:opacity-90',
                'brand-secondary':
                    'bg-brand-secondary text-brand-secondary-foreground font-semibold hover:opacity-90',
                accent: 'text-emerald-600 bg-emerald-600/10 hover:bg-emerald-600/20',
                outlined: 'bg-background text-foreground outline outline-border hover:bg-secondary',
                destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
                bordered:
                    'border border-border bg-background text-foreground opacity-100 hover:opacity-80',
                secondary:
                    'bg-quaternary text-emerald-900 opacity-100 hover:opacity-80 [&>svg]:text-emerald-900',
                ghost: 'hover:bg-tertiary text-foreground opacity-100 hover:opacity-80',
                link: 'text-muted-foreground underline-offset-4 hover:underline h-auto decoration-border',
                text: 'p-0 text-xs',
            },
            size: {
                default: 'h-9 px-3 text-xs md:text-sm',
                sm: 'h-8 px-3 text-xs md:text-xs rounded-xl',
                xs: 'h-7 px-2 text-xs md:text-xs',
                md: 'h-9 px-4 text-xs md:text-sm font-semibold',
                lg: 'h-12 md:h-14  px-8 text-xs md:text-base font-semibold',
                icon: 'h-8 min-w-8 text-xs md:text-sm',
                'icon-sm': 'h-7 min-w-7 text-xs md:text-sm',
                'icon-xs': 'h-6 min-w-6 text-xs md:text-sm',
                'link-sm': 'p-0 text-xs',
                link: 'p-0',
            },
            rounded: {
                default: 'rounded-sm',
                lg: 'rounded-md',
                xl: 'rounded-xl',
                full: 'rounded-full',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            rounded: 'lg',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    suffixIcon?: LucideIcon;
    icon?: LucideIcon;
    iconSize?: 'xs' | 'sm' | 'md' | 'lg';
    prefixIcon?: LucideIcon;
    tooltip?: string;
    tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            iconSize = 'sm',
            rounded,
            asChild = false,
            prefixIcon,
            suffixIcon,
            icon,
            children,
            tooltip,
            tooltipSide = 'top',
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : 'button';
        const PrefixIcon = prefixIcon;
        const SuffixIcon = suffixIcon;
        const Icon = icon;

        const iconSizes = {
            xs: 10,
            sm: 12,
            md: 14,
            lg: 16,
        } as const;

        const ToolTipWrapper = tooltip ? Tooltip : React.Fragment;

        const buttonComp = (
            <Comp
                className={cn(buttonVariants({ variant, size, rounded, className }))}
                ref={ref}
                {...props}
            >
                {PrefixIcon && <PrefixIcon size={iconSizes[iconSize]} strokeWidth={2} />}
                {Icon ? <Icon size={iconSizes[iconSize]} strokeWidth={2} /> : children}
                {SuffixIcon && <SuffixIcon size={iconSizes[iconSize]} strokeWidth={2} />}
            </Comp>
        );

        if (tooltip) {
            return (
                <ToolTipWrapper content={tooltip} side={tooltipSide}>
                    {buttonComp}
                </ToolTipWrapper>
            );
        }

        return buttonComp;
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
