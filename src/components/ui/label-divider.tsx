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
      className={cn("flex flex-row items-center w-full pb-4 pt-8", className)}
    >
      <div className="w-full h-[1px] bg-white/5"></div>
      <p className="text-xs text-zinc-500 px-2 flex-shrink-0">{label}</p>
      <div className="w-full h-[1px] bg-white/5"></div>
    </motion.div>
  );
};
