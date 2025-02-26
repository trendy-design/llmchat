import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
export type TLabelDivider = {
  label: string;
  className?: string;
  transitionDuration?: number;
};
export const LabelDivider = ({ label, className, transitionDuration = 1 }: TLabelDivider) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: transitionDuration } }}
      className={cn('flex w-full flex-row items-center py-4', className)}
    >
      <div className="to-transaprent from-border/50 h-[1px] w-full bg-gradient-to-l"></div>
      <p className="text-muted-foreground flex-shrink-0 px-2 text-sm md:text-base">{label}</p>
      <div className="from-border/50 h-[1px] w-full bg-gradient-to-r to-transparent"></div>
    </motion.div>
  );
};
