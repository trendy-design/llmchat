import { cn } from '@repo/ui';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import React, { memo, type ReactNode } from 'react';

interface ReasoningProps {
  children: ReactNode;
  index: number;
  isComplete: boolean;
  isLast: boolean;
  isFirst: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Spinner = memo(() => (
  <div className="border-border border-l-brand border-t-brand size-sm shrink-0 animate-spin rounded-full border-[2px]" />
));

Spinner.displayName = 'Spinner';

export const Reasoning: React.FC<ReasoningProps> = memo(
  ({ children, index, isComplete, isLast, isFirst }) => {
    return (
      <motion.div
        key={`reasoning-${index}`}
        className="flex flex-row"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.1 }}
      >
        <div className="flex w-8 shrink-0 flex-col items-center justify-center">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'h-8 w-[1px]',
              isFirst ? 'from-border bg-gradient-to-t from-20% to-transparent' : 'bg-border'
            )}
          />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.1 }}>
            {isComplete ? (
              <IconCircleCheckFilled size={16} className="text-brand shrink-0" />
            ) : (
              <Spinner />
            )}
          </motion.div>
          <motion.div
            className={cn(
              'h-full w-[1px]',
              isLast ? 'from-border bg-gradient-to-b to-transparent' : 'bg-border'
            )}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <motion.div
          className="flex flex-1 flex-col gap-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
        >
          <div className="relative flex w-full flex-row items-stretch justify-start">
            <div className={cn('w-full rounded-lg px-3 text-sm')}>{children}</div>
          </div>
        </motion.div>
      </motion.div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.isComplete === nextProps.isComplete &&
    prevProps.index === nextProps.index &&
    prevProps.children === nextProps.children &&
    prevProps.isLast === nextProps.isLast
);

Reasoning.displayName = 'Reasoning';
