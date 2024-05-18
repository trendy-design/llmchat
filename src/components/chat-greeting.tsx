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
    <div className="flex flex-row items-center w-[680px] justify-start gap-2">
      <motion.h1
        className="text-2xl font-semibold tracking-tight text-zinc-700 dark:text-zinc-100"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            duration: 1,
          },
        }}
      >
        <span className="text-zinc-400 dark:text-zinc-500">
          {renderGreeting("Deep")}
        </span>
        <br />
        How can I help you today? 😊
      </motion.h1>
    </div>
  );
};
