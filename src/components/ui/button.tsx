import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center gap-1 justify-center whitespace-nowrap rounded-md text-sm  transition-colors focus-visible:outline-none ",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-normal  hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-black/10 text-zinc-600 dark:text-zinc-300 hover:bg-black/15 dark:bg-white/10",
        ghost:
          "hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 hover:text-zinc-800 dark:text-zinc-200 dark:hover:text-white",
        link: "text-primary underline-offset-4 hover:underline h-auto decoration-black/20 dark:decoration-white/20",
      },
      size: {
        default: "h-10 px-4 py-3",
        sm: "h-8 px-3 text-xs",
        lg: "h-12  px-8",
        icon: "h-9 min-w-9",
        iconSm: "h-8 min-w-8",
        iconXS: "h-6 min-w-6 text-xs",
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
