import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/utils';

const alertVariants = cva(
    'relative w-full rounded-lg px-3 py-2.5 text-xs font-medium  [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground  [&>svg~*]:pl-6 dark:border-border dark:[&>svg]:text-foreground',
    {
        variants: {
            variant: {
                default: 'bg-secondary text-secondary-foreground',
                success: 'bg-brand/10 text-brand [&>svg]:text-brand ',
                info: 'bg-background border border-border shadow-subtle-sm text-blue-700 [&>svg]:text-blue-700',
                warning: 'bg-yellow-700/10 text-yellow-700 [&>svg]:text-yellow-700',
                destructive:
                    'bg-background border border-border text-rose-600/70 [&>svg]:text-rose-600/70',
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
            className={cn(
                'mb-1 text-xs font-medium leading-none tracking-tight md:text-sm',
                className
            )}
            {...props}
        />
    )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('inline-flex gap-2 text-xs [&_p]:leading-relaxed', className)}
        {...props}
    />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription, AlertTitle };
