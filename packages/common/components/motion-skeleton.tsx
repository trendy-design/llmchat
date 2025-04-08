import { cn } from '@repo/ui';

import { Skeleton } from '@repo/ui';
import { motion } from 'framer-motion';

export const MotionSkeleton = ({ className }: { className?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, width: '0%' }}
            animate={{ opacity: 1, width: '100%' }}
            exit={{ opacity: 0, width: '0%' }}
            transition={{ duration: 2, ease: 'easeInOut', damping: 50, stiffness: 20 }}
        >
            <Skeleton
                className={cn(
                    'from-muted-foreground/90 via-muted-foreground/60 to-muted-foreground/10 h-5 w-full rounded-sm bg-gradient-to-r',
                    className
                )}
            />
        </motion.div>
    );
};
