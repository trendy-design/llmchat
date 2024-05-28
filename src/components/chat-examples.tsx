import { examplePrompts } from "@/lib/prompts";
import { Asterisk } from "lucide-react";
import { motion } from "framer-motion";

export type TChatExamples = {
  onExampleClick: (prompt: string) => void;
  show: boolean;
};
export const ChatExamples = ({ onExampleClick, show }: TChatExamples) => {
  if (!show) return null;
  return (
    <div className="flex flex-col gap-3 mb-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-3 md:w-[700px] w-full">
        {examplePrompts?.map((example, index) => (
          <motion.div
            initial={{
              opacity: 0,
            }}
            className="flex bg-white dark:bg-zinc-800 flex-col gap-4 items-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4  border border-black/10 dark:border-white/5 text-zinc-600 dark:text-zinc-400 w-full rounded-2xl hover:bg-zinc-50 dark:hover:bg-black/20 cursor-pointer"
            key={index}
            animate={{
              opacity: 1,
            }}
            onClick={() => {
              onExampleClick(example.prompt);
            }}
          >
            <Asterisk size={20} stroke="2" />
            <p className="text-sm md:text-base text-zinc-800 dark:text-white font-medium w-full">
              {example.title}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
