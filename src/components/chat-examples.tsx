import { useBots } from "@/context/bots/context";
import { useChatContext } from "@/context/chat/provider";
import { usePrompts } from "@/context/prompts/context";
import { ArrowDown, ArrowRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { ChatGreeting } from "./chat-greeting";
import { BotAvatar } from "./ui/bot-avatar";
import { Button } from "./ui/button";
import { Flex } from "./ui/flex";
import { Tooltip } from "./ui/tooltip";

export type TChatExamples = {};
export const ChatExamples = () => {
  const { allPrompts } = usePrompts();
  const { allBots, open: openBots } = useBots();
  const { editor } = useChatContext();
  return (
    <Flex
      direction="col"
      gap="md"
      className="flex-1 h-screen"
      justify="center"
      items="center"
    >
      {!!allPrompts?.length && <ChatGreeting />}
      <div className="flex flex-col gap-3 mb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-3 md:w-[700px] lg:w-[720px] w-full">
          {allPrompts.slice(0, 3)?.map((example, index) => (
            <motion.div
              initial={{
                opacity: 0,
              }}
              className="flex bg-white dark:bg-zinc-800 flex-col gap-4 items-start text-sm md:text-base min-h-[140px] py-2 px-3 md:py-3 md:px-4  border border-black/10 dark:border-white/5 text-zinc-600 dark:text-zinc-400 w-full rounded-2xl hover:bg-zinc-50 dark:hover:bg-black/20 cursor-pointer relative"
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
              <p className="text-sm md:text-base tracking-[-0.02em] text-zinc-800 dark:text-white font-medium w-full">
                {example.name}
              </p>
              <Button
                size="iconXS"
                rounded="full"
                variant="secondary"
                className="absolute right-4 bottom-4"
              >
                <ArrowDown size={15} weight="bold" />
              </Button>
            </motion.div>
          ))}
          <motion.div
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
          </motion.div>
        </div>
      </div>
    </Flex>
  );
};
