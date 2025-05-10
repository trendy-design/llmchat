'use client';
import { cn } from '@repo/ui';
import { motion } from 'framer-motion';
import React, { useMemo, type JSX } from 'react';

export type TextShimmerProps = {
    children: string;
    as?: React.ElementType;
    className?: string;
    duration?: number;
    spread?: number;
};

function TextShimmerComponent({
    children,
    as: Component = 'p',
    className,
    duration = 4,
    spread = 2,
}: TextShimmerProps) {
    const MotionComponent = motion(Component as keyof JSX.IntrinsicElements);

    const dynamicSpread = useMemo(() => {
        return children.length * spread;
    }, [children, spread]);

    return (
        <MotionComponent
            className={cn(
                'relative inline-block bg-[length:250%_100%,auto] bg-clip-text',
                'text-transparent [--base-color:#999999] [--base-gradient-color:#000000]',
                '[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]',
                'dark:[--base-color:#999999] dark:[--base-gradient-color:#000000]',
                className
            )}
            initial={{ backgroundPosition: '100% center' }}
            animate={{ backgroundPosition: '0% center' }}
            transition={{
                repeat: Infinity,
                duration,
                ease: 'easeInOut',
            }}
            style={
                {
                    '--spread': `${dynamicSpread}px`,
                    backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
                } as React.CSSProperties
            }
        >
            {children}
        </MotionComponent>
    );
}

export const TextShimmer = React.memo(TextShimmerComponent);
