import { useBots } from "@/context/bots/context";
import { useChatContext } from "@/context/chat/provider";
import { usePrompts } from "@/context/prompts/context";
import { ArrowRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Flex } from "./ui/flex";
import { Type } from "./ui/text";

export type TChatExamples = {};
export const ChatExamples = () => {
  const { allPrompts } = usePrompts();
  const { allBots, open: openBots } = useBots();
  const { editor } = useChatContext();
  if (!allPrompts?.length) {
    return null;
  }
  return (
    <Flex direction="col" gap="md" justify="center" items="center">
      <div className="flex flex-col gap-3 p-4">
        <Type size="sm" textColor="tertiary">
          Try Prompts
        </Type>
        <div className="flex flex-col gap-1 md:gap-3 md:w-[700px] lg:w-[720px] w-full">
          {allPrompts.slice(0, 3)?.map((example, index) => (
            <motion.div
              initial={{
                opacity: 0,
              }}
              className="flex bg-white dark:bg-zinc-800 flex-row gap-2 items-center text-sm md:text-base dark:border-white/5 text-zinc-600 dark:text-zinc-400 w-full  cursor-pointer relative"
              key={index}
              animate={{
                opacity: 1,
              }}
              onClick={() => {
                editor?.commands?.clearContent();
                editor?.commands?.setContent(example.content);
                editor?.commands?.focus("end");
              }}
            >
              <ArrowRight size={16} weight="bold" />
              <p className="text-sm md:text-base hover:underline hover:decoration-zinc-500 hover:underline-offset-4 text-zinc-800 dark:text-white font-medium w-full">
                {example.name}
              </p>
            </motion.div>
          ))}
          {/* <motion.div
            initial={{
              opacity: 0,
            }}
            className="flex bg-white dark:bg-zinc-800 flex-col gap-4 items-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4  border border-black/10 dark:border-white/5 text-zinc-600 dark:text-zinc-400 w-full rounded-2xl hover:bg-zinc-50 dark:hover:bg-black/20 cursor-pointer relative"
            animate={{
              opacity: 1,
            }}
            onClick={() => {
              openBots();
            }}
          >
            <p className="text-sm md:text-base text-zinc-800 dark:text-white font-medium w-full">
              Popular bots
            </p>
            <Flex gap="sm">
              {allBots?.map((bot) => (
                <Tooltip content={bot.name} key={bot.id}>
                  <BotAvatar name={bot.name} avatar={bot.avatar} size="small" />
                </Tooltip>
              ))}
            </Flex>
            <Button
              size="iconXS"
              rounded="full"
              variant="secondary"
              className="absolute right-4 bottom-4"
            >
              <ArrowRight size={15} weight="bold" />
            </Button>
          </motion.div> */}
        </div>
      </div>
    </Flex>
  );
};
