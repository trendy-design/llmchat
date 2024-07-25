import * as React from "react";

import { cn } from "@/helper/clsx";
import { VariantProps, cva } from "class-variance-authority";

const inputVariants = cva(
  "flex h-12 w-full rounded-xl outline-none  border-none px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm md:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-black/5 dark:bg-white/5",
        ghost: "bg-transparent",
      },
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-8 px-3 py-2 text-xs md:text-sm",
      },
      rounded: {
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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, rounded, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
