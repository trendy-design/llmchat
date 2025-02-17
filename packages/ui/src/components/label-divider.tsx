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
      <div className="to-transaprent h-[1px] w-full bg-gradient-to-l from-black/5 dark:from-white/5"></div>
      <p className="flex-shrink-0 px-2 text-sm text-zinc-500 md:text-base">{label}</p>
      <div className="h-[1px] w-full bg-gradient-to-r from-black/5 to-transparent dark:from-white/5"></div>
    </motion.div>
  );
};
