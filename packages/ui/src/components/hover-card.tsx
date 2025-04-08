'use client';

import { flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react';
import * as React from 'react';
import { cn } from '../lib/utils';

type HoverCardProps = {
    openDelay?: number;
    closeDelay?: number;
    children: React.ReactNode;
};

const HoverCard = ({ openDelay = 200, closeDelay = 200, children }: HoverCardProps) => {
    return (
        <HoverCardRoot openDelay={openDelay} closeDelay={closeDelay}>
            {children}
        </HoverCardRoot>
    );
};

type HoverCardRootProps = {
    openDelay?: number;
    closeDelay?: number;
    children: React.ReactNode;
};

const HoverCardRoot = ({ openDelay, closeDelay, children }: HoverCardRootProps) => {
    const [open, setOpen] = React.useState(false);

    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: setOpen,
        middleware: [offset(4), flip(), shift()],
    });

    const hover = useHover(context, {
        delay: { open: openDelay, close: closeDelay },
    });

    const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

    // Remove useTransition since it's not available
    const isMounted = open;

    // Clone children to inject refs and props
    const childrenArray = React.Children.toArray(children);
    const triggerChild = childrenArray.find(
        child => React.isValidElement(child) && child.type === HoverCardTrigger
    );
    const contentChild = childrenArray.find(
        child => React.isValidElement(child) && child.type === HoverCardContent
    );

    if (!React.isValidElement(triggerChild) || !React.isValidElement(contentChild)) {
        return null;
    }

    // Type-safe casting
    const trigger = triggerChild as React.ReactElement<
        React.ComponentPropsWithRef<typeof HoverCardTrigger>
    >;
    const content = contentChild as React.ReactElement;

    // Fix the cloneElement type issue by properly casting and handling ref
    const clonedTrigger = React.cloneElement(trigger, {
        ref: (node: HTMLDivElement) => {
            refs.setReference(node);
        },
        ...getReferenceProps(),
    });

    return (
        <>
            {clonedTrigger}
            {isMounted && (
                <div
                    ref={refs.setFloating}
                    style={{ ...floatingStyles, zIndex: 999 }}
                    {...getFloatingProps()}
                >
                    {content}
                </div>
            )}
        </>
    );
};

type HoverCardTriggerProps = React.HTMLAttributes<HTMLDivElement>;

const HoverCardTrigger = React.forwardRef<HTMLDivElement, HoverCardTriggerProps>((props, ref) => (
    <div ref={ref} {...props} className="inline-block cursor-pointer" />
));
HoverCardTrigger.displayName = 'HoverCardTrigger';

type HoverCardContentProps = React.HTMLAttributes<HTMLDivElement>;

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'bg-background text-card-foreground isolate z-[200] flex max-w-64 flex-col items-start rounded-md border p-4 shadow-md outline-none',
                'animate-in fade-in-0 zoom-in-95',
                className
            )}
            {...props}
        />
    )
);
HoverCardContent.displayName = 'HoverCardContent';

export { HoverCard, HoverCardContent, HoverCardTrigger };
