import * as React from "react";

import { cn } from "@/helper/clsx";
import { VariantProps, cva } from "class-variance-authority";

const inputVariants = cva(
  "flex h-11 w-full rounded-xl outline-none  border-none px-3  text-sm transition-colors file:border-0 file:bg-transparent file:text-sm md:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-black/10 dark:bg-white/5",
        ghost: "bg-transparent",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-xs md:text-sm",
      },
      rounded: {
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
  },
);
Input.displayName = "Input";

export { Input };
