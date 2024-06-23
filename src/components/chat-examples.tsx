import { useChatContext } from "@/context";
import { ArrowRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Flex } from "./ui/flex";
import { Type } from "./ui/text";

export type TChatExamples = {};
export const ChatExamples = () => {
  const { editor } = useChatContext();
  const allPropmts = [
    {
      id: "621d5e4f-4b56-4302-97cd-5b837b6296ab",
      created_at: "2024-06-09T07:38:30.220026+00:00",
      name: "Craft Engaging Marketing Email Copy",
      content:
        "Write marketing copy to make my marketing emails more engaging. The copy must be about our {{{{product, service, or company}}}} ",
      category: "Marketing",
    },
    {
      id: "779820b7-f900-4b8b-a03b-1f01bddf2980",
      created_at: "2024-06-11T08:38:00.996295+00:00",
      name: "Generate a SQL query",
      content:
        "Generate a SQL query to {{{{count and sort unique logins in the last month}}}}",
      category: "coding",
    },
    {
      id: "2a502ea1-88fe-4bbf-946e-e78a08eee0d3",
      created_at: "2024-06-11T10:47:30.506062+00:00",
      name: "Suggest python library to solve a problem",
      content: "Suggest python library to solve {{{{a problem}}}}",
      category: "coding",
    },
    {
      id: "83b98019-5885-4d59-becc-827a8587e0bb",
      created_at: "2024-06-11T10:50:02.82221+00:00",
      name: "Design a fun coding game",
      content: "Design a fun {{{{snake paper}}}} coding game",
      category: "coding",
    },
  ];
  return (
    <Flex direction="col" gap="md" justify="center" items="center">
      <div className="flex flex-col gap-3 p-4">
        <Type size="sm" textColor="tertiary">
          Try Prompts
        </Type>
        <div className="flex flex-col gap-1 md:gap-3 md:w-[700px] lg:w-[720px] w-full">
          {allPropmts?.slice(0, 3)?.map((example, index) => (
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
        </div>
      </div>
    </Flex>
  );
};
