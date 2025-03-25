import * as React from 'react';
import { cn } from '../lib/utils';

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(({ className, children, ...props }, ref) => {
    return (
        <kbd
            ref={ref}
            className={cn(
                'text-foreground border-border bg-background flex h-5 items-center justify-center rounded-md border px-1.5 font-mono text-[10px] font-semibold',
                className
            )}
            {...props}
        >
            {children}
        </kbd>
    );
});

Kbd.displayName = 'Kbd';

export { Kbd };
