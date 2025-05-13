'use client';
import { CommandSearch, ResponsiveSidebar } from '@repo/common/components';
import { AgentProvider } from '@repo/common/hooks';
import { plausible } from '@repo/shared/utils';
import { cn, Flex, Toaster } from '@repo/ui';
import { motion } from 'framer-motion';
import { FC, useEffect } from 'react';

export type TRootLayout = {
    children: React.ReactNode;
};

export const RootLayout: FC<TRootLayout> = ({ children }) => {
    const containerClass = cn(
        'relative flex flex-1 flex-row h-[calc(100dvh)] w-full overflow-hidden'
    );

    useEffect(() => {
        plausible.trackPageview();
    }, []);

    return (
        <div className={cn('bg-secondary flex h-[100dvh] w-full flex-row overflow-hidden')}>
            <ResponsiveSidebar />

            <Flex className="flex-1 overflow-hidden">
                <motion.div className="flex w-full">
                    <AgentProvider>
                        <div className={containerClass}>
                            <DesktopDraggable />
                            <div className="relative flex h-full w-0 flex-1 flex-row">
                                <div className="flex w-full flex-col gap-2 overflow-y-auto">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </AgentProvider>
                </motion.div>
                <CommandSearch />
            </Flex>

            <Toaster />
        </div>
    );
};

export const DesktopDraggable = () => {
    return <div className="draggable -z-1 absolute left-0 right-0 top-0 h-12 w-full" />;
};
