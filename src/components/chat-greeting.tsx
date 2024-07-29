import { motion } from "framer-motion";

export const ChatGreeting = () => {
  return (
    <div className="flex w-full flex-row items-start justify-start gap-2 md:w-[720px]">
      <motion.h1
        className="py-2 text-left text-3xl font-semibold leading-9 tracking-tight text-zinc-800 dark:text-zinc-100"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            duration: 1,
          },
        }}
      >
        Good Morning,
        <br />
        <span className="text-zinc-300 dark:text-zinc-500">
          How can I help you today?
        </span>
      </motion.h1>
    </div>
  );
};
