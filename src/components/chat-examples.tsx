import { examplePrompts } from "@/lib/prompts";
import { cn } from "@/lib/utils";
import { StarFour } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export type TChatExamples = {
  onExampleClick: (prompt: string) => void;
};
export const ChatExamples = ({ onExampleClick }: TChatExamples) => {
  return (
    <div className="flex flex-col gap-1 mt-8">
      <div className="grid grid-cols-3 gap-4 w-[700px]">
        {examplePrompts?.map((example, index) => (
          <motion.div
            initial={{
              rotate: 0,
              scale: 0.9,
              opacity: 0,
            }}
            transition={{ delay: 1 }}
            className="flex bg-zinc-800 flex-col gap-2 items-start text-sm py-3 px-4 border border-white/5 text-zinc-400 w-full rounded-2xl hover:bg-black/20 hover:scale-[101%] cursor-pointer"
            key={index}
            animate={{
              rotate: index % 2 === 0 ? -2 : 2,
              scale: 1,
              opacity: 1,
            }}
            whileHover={{
              scale: 1.05,
              rotate: index % 2 === 0 ? -1 : 1,
            }}
            onClick={() => {
              onExampleClick(example.prompt);
            }}
          >
            <StarFour
              size={20}
              weight="bold"
              className={cn(
                index === 0 && "text-purple-400",
                index === 1 && "text-green-400",
                index === 2 && "text-blue-400"
              )}
            />
            <p className="text-sm text-white font-semibold w-full">
              {example.title}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
