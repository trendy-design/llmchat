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
    <div className="flex flex-row items-start justify-start w-[720px] gap-2">
      <motion.h1
        className="text-2xl font-semibold text-left mb-4 leading-8 tracking-tight text-zinc-900 dark:text-zinc-100"
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
