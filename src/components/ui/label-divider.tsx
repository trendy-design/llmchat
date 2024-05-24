import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
export type TLabelDivider = {
  label: string;
  className?: string;
  transitionDuration?: number;
};
export const LabelDivider = ({
  label,
  className,
  transitionDuration = 1,
}: TLabelDivider) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: transitionDuration } }}
      className={cn("flex flex-row items-center w-full py-4", className)}
    >
      <div className="w-full h-[1px] dark:from-white/5 from-black/5 bg-gradient-to-l to-transaprent"></div>
      <p className="text-sm md:text-base text-zinc-500 px-2 flex-shrink-0">
        {label}
      </p>
      <div className="w-full h-[1px] dark:from-white/5 from-black/5 bg-gradient-to-r to-transparent "></div>
    </motion.div>
  );
};
