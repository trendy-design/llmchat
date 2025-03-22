'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import { cn } from '../lib/utils';
const TooltipProvider = TooltipPrimitive.Provider;

const TooltipBase = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-lg bg-foreground px-2 py-1 text-xs font-medium text-background',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export type TTooltip = {
  children: React.ReactNode;
  content: React.ReactNode;
  sideOffset?: number;
  side?: 'left' | 'right' | 'top' | 'bottom';
};

const Tooltip = ({ children, content, side, sideOffset }: TTooltip) => {
  return (
    <TooltipBase delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={sideOffset}>
        {content}
      </TooltipContent>
    </TooltipBase>
  );
};

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
