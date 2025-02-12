import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg px-3 py-3 text-sm md:text-base [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-3 [&>svg]:text-zinc-950 [&>svg~*]:pl-6 dark:border-zinc-800 dark:[&>svg]:text-zinc-50",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-50/20 text-zinc-500 dark:bg-black/20 dark:text-zinc-200",
        success:
          "bg-green-50 text-green-950 dark:bg-green-500/10 dark:text-green-500 [&>svg]:text-green-500 dark:[&>svg]:text-green-500",
        warning:
          "bg-yellow-500/10 text-yellow-950 dark:bg-yellow-300/10 dark:text-yellow-100 [&>svg]:text-yellow-500 dark:[&>svg]:text-yellow-100",
        destructive:
          "bg-transparent text-zinc-400  [&>svg]:text-red-300 dark:text-red-300  dark:[&>svg]:text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "mb-1 text-xs font-medium leading-none tracking-tight md:text-sm",
      className,
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs md:text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
