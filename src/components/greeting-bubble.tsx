import { TBot } from "@/hooks/use-bots";
import { REVEAL_ANIMATION_VARIANTS } from "@/hooks/use-mdx";
import { motion } from "framer-motion";
import { BotAvatar } from "./ui/bot-avatar";

export type TGreetingBubble = {
  bot: TBot;
};
export const GreetingBubble = ({ bot }: TGreetingBubble) => {
  return (
    <div className="flex  flex-col md:flex-row gap-2 mt-6 w-full">
      <div className="px-0 md:px-3 py-1">
        <BotAvatar size={24} name={bot?.name} />
      </div>
      <div className="rounded-2xl w-full flex flex-col items-start">
        <div className="py-1 w-full">
          <p className="text-sm md:text-base">
            <motion.span
              variants={REVEAL_ANIMATION_VARIANTS}
              className="dark:text-zinc-100 text-zinc-700 tracking-[0.01em]"
              animate={"visible"}
              initial={"hidden"}
            >
              {bot.greetingMessage}
            </motion.span>
          </p>
        </div>
      </div>
    </div>
  );
};
