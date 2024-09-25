import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils/clsx";
import { LucideIcon } from "@/libs/types/icons";

const buttonVariants = cva(
  "inline-flex items-center gap-1 justify-center font-medium whitespace-nowrap rounded-md transition-colors focus-visible:outline-none ",
  {
    variants: {
      variant: {
        default:
          "dark:bg-zinc-100 dark:text-zinc-800 text-white bg-zinc-800 hover:opacity-90",
        accent: "text-teal-600 bg-teal-600/10 hover:bg-teal-600/20",
        outlined:
          "dark:bg-zinc-800 dark:text-white text-zinc-800 bg-white outline outline-zinc-800/10  dark:outline-white/5  hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50",
        destructive:
          "bg-rose-500/80 dark:bg-rose-500/80 text-destructive-foreground hover:bg-red-500 dark:hover:opacity-90",
        bordered:
          "border border-zinc-500/20  bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100  opacity-100 hover:opacity-80",
        secondary:
          "bg-zinc-500/15 text-zinc-800 dark:text-white opacity-100 hover:opacity-80 ",
        ghost:
          "hover:bg-zinc-500/15 text-zinc-800 dark:text-white opacity-100 hover:opacity-80",
        link: "text-zinc-600 text-zinc-400 underline-offset-4 hover:underline h-auto decoration-black/20 dark:decoration-white/20",
        text: "p-0 text-xs",
      },
      size: {
        default: "h-9 px-3 text-xs md:text-[0.850rem]",
        sm: "h-8 px-3 text-xs md:text-[0.825rem]",
        xs: "h-7 px-2 text-xs",
        md: "h-11 px-4 text-xs md:text-sm font-semibold",
        lg: "h-12 md:h-14  px-8 text-xs md:text-base font-semibold",
        icon: "h-9 min-w-9 text-xs md:text-sm",
        "icon-sm": "h-8 min-w-8 text-xs md:text-sm",
        "icon-xs": "h-7 min-w-7 text-xs md:text-sm",
        "link-sm": "p-0 text-xs",
        link: "p-0",
      },
      rounded: {
        default: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "lg",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  suffixIcon?: LucideIcon;
  icon?: LucideIcon;
  iconSize?: "xs" | "sm" | "md" | "lg";
  prefixIcon?: LucideIcon;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      iconSize = "sm",
      rounded,
      asChild = false,
      prefixIcon,
      suffixIcon,
      icon,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const PrefixIcon = prefixIcon;
    const SuffixIcon = suffixIcon;
    const Icon = icon;

    const iconSizes = {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
    } as const;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      >
        {PrefixIcon && (
          <PrefixIcon size={iconSizes[iconSize]} strokeWidth={2} />
        )}
        {Icon ? <Icon size={iconSizes[iconSize]} strokeWidth={2} /> : children}
        {SuffixIcon && (
          <SuffixIcon size={iconSizes[iconSize]} strokeWidth={2} />
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
