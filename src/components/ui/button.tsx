import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/helper/clsx";

const buttonVariants = cva(
  "inline-flex items-center gap-1 justify-center font-medium whitespace-nowrap rounded-md   transition-colors focus-visible:outline-none ",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-800 text-white dark:outline dark:outline-white/10  hover:bg-zinc-900/50",
        destructive:
          "bg-red-400 dark:bg-red-400/50 text-destructive-foreground hover:bg-red-500 dark:hover:bg-red-500/50",
        outline:
          "border border-zinc-500/30 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-100 dark:hover:text-white hover:text-zinc-900",
        secondary:
          "bg-black/10 text-zinc-700 dark:text-zinc-100 hover:bg-black/15 dark:bg-white/5",
        ghost:
          "hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 hover:text-zinc-800 dark:text-zinc-300 dark:hover:text-white",
        link: "text-zinc-600 text-zinc-400 underline-offset-4 hover:underline h-auto decoration-black/20 dark:decoration-white/20",
        text: "p-0 text-xs",
      },
      size: {
        default: "h-10 px-4 py-3 text-xs md:text-sm",
        sm: "h-8 px-3 text-xs md:text-sm",
        lg: "h-12  px-8 text-xs md:text-sm",
        icon: "h-9 min-w-9 text-xs md:text-sm",
        iconSm: "h-8 min-w-8 text-xs md:text-sm",
        iconXS: "h-6 min-w-6 text-xs md:text-sm",
        linkSm: "p-0 text-xs",
        link: "p-0",
      },
      rounded: {
        default: "rounded-md",
        lg: "rounded-xl",

        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "lg",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
