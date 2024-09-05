import { examplePrompts } from "@/config";
import { useChatContext } from "@/lib/context";
import { slideUpVariant } from "@/lib/utils/animations";
import { Flex, StaggerContainer, Type } from "@/ui";
import { motion } from "framer-motion";

export const ChatExamples = () => {
  const { store } = useChatContext();
  const editor = store((state) => state.editor);

  return (
    <Flex
      direction="col"
      gap="sm"
      justify="center"
      items="start"
      className="w-full"
    >
      <Type size="sm" textColor="tertiary">
        Try these example prompts or craft your own message
      </Type>
      <StaggerContainer>
        <div className="grid grid-cols-1 gap-1 overflow-x-auto md:grid-cols-2">
          {examplePrompts?.slice(0, 4)?.map((prompt, index) => (
            <motion.div
              key={prompt.name}
              variants={slideUpVariant}
              className="w-full"
            >
              <Flex
                key={index}
                direction="col"
                className="w-full cursor-pointer justify-start gap-3 rounded-lg bg-zinc-500/10 p-3 !text-sm opacity-80 hover:opacity-100"
                onClick={() => {
                  editor?.commands?.clearContent();
                  editor?.commands?.setContent(prompt.content);
                  editor?.commands?.focus("end");
                }}
              >
                {prompt.name}
              </Flex>
            </motion.div>
          ))}
        </div>
      </StaggerContainer>
      <div
        className="relative mx-1 my-3 h-2 w-full opacity-10 dark:invert"
        style={{
          backgroundImage: 'url("./icons/wavy.svg")',
          backgroundRepeat: "repeat-x",
          backgroundSize: "contain",
          backgroundPosition: "0 0",
        }}
      />
    </Flex>
  );
};
