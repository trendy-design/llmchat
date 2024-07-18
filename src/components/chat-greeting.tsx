import { WavingHand02Icon } from "@hugeicons/react";
import { motion } from "framer-motion";

export const ChatGreeting = () => {
  return (
    <div className="flex flex-row items-start justify-start w-[720px] gap-2">
      <motion.h1
        className="text-3xl font-semibold py-2 text-left leading-9 tracking-tight text-zinc-800 dark:text-zinc-100"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            duration: 1,
          },
        }}
      >
        <span className="text-zinc-300 dark:text-zinc-500 flex items-center flex-row gap-1">
          <WavingHand02Icon size={32} variant="stroke" strokeWidth="2" />
          Hello,
        </span>
        How can I help you today?
      </motion.h1>
    </div>
  );
};
