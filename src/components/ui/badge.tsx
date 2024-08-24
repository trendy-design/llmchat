import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/helper/clsx";

const badgeVariants = cva(
  "flex items-center whitespace-nowrap rounded-sm px-1.5 py-0.5  min-h-2 text-xs font-medium transition-colors text-zinc-500 ",
  {
    variants: {
      variant: {
        default: "text-teal-600 bg-teal-600/20",
        secondary: "border-transparent bg-secondary hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground bg-white dark:bg-zinc-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
