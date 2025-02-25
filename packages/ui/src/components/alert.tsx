import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg px-3 py-3 text-sm md:text-base [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-3 [&>svg]:text-foreground [&>svg~*]:pl-6 dark:border-border dark:[&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        success: 'bg-brand/10 text-brand [&>svg]:text-brand ',
        warning: 'bg-destructive/10 text-destructive [&>svg]:text-destructive',
        destructive: 'bg-transparent text-muted-foreground [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 text-xs font-medium leading-none tracking-tight md:text-sm', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-xs md:text-sm [&_p]:leading-relaxed', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription, AlertTitle };
