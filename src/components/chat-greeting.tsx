import { motion } from "framer-motion";
import moment from "moment";

export const ChatGreeting = () => {
  const renderGreeting = (name: string) => {
    const date = moment();
    const hours = date.get("hour");
    if (hours < 12) return `Good Morning,`;
    if (hours < 18) return `Good Afternoon,`;
    return `Good Evening,`;
  };

  return (
    <div className="flex flex-row items-center justify-center w-[680px] flex-1 gap-2">
      <motion.h1
        className="text-4xl font-bold text-center leading-10 tracking-tighter text-zinc-800 dark:text-zinc-100"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            duration: 1,
          },
        }}
      >
        <span className="text-zinc-300 dark:text-zinc-500">
          {renderGreeting("Deep")}
        </span>
        <br />
        How can I help you today? 😊
      </motion.h1>
    </div>
  );
};
