import { zoomVariant } from "@/lib/framer-motion";
import { examplePrompts } from "@/lib/prompts";
import { motion } from "framer-motion";
import { LabelDivider } from "./ui/label-divider";

export type TChatExamples = {
  onExampleClick: (prompt: string) => void;
};
export const ChatExamples = ({ onExampleClick }: TChatExamples) => {
  return (
    <div className="flex flex-col gap-1">
      <LabelDivider
        label={"Examples"}
        className="pt-0"
        transitionDuration={4}
      />
      <div className="grid grid-cols-3 gap-2 w-[700px]">
        {examplePrompts?.map((example, index) => (
          <motion.div
            variants={zoomVariant}
            transition={{ delay: 1 }}
            initial={"initial"}
            animate={"animate"}
            className="flex flex-col gap-2 items-start text-sm py-3 px-4 border border-white/5 text-zinc-400 w-full rounded-2xl hover:bg-black/20 hover:scale-[101%] cursor-pointer"
            key={index}
            onClick={() => {
              onExampleClick(example.prompt);
            }}
          >
            <p className="text-sm text-white font-semibold w-full">
              {example.title}
            </p>
            <p className="text-xs text-zinc-500 truncate w-full">
              {example.prompt}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
