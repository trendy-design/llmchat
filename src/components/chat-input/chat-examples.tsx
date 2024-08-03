import { Button } from "@/components/ui";
import { Flex } from "@/components/ui/flex";
import { StaggerContainer } from "@/components/ui/stagger-container";
import { Type } from "@/components/ui/text";
import { examplePrompts } from "@/config";
import { useChatContext } from "@/context";
import { slideUpVariant } from "@/helper/animations";
import { SentIcon } from "@hugeicons/react";
import { motion } from "framer-motion";

export const ChatExamples = () => {
  const { store } = useChatContext();
  const editor = store((state) => state.editor);

  return (
    <Flex
      direction="col"
      gap="md"
      justify="center"
      items="start"
      className="w-full"
    >
      <Type size="base" weight="medium">
        Try these example prompts or craft your own message below
      </Type>
      <StaggerContainer>
        <div className="flex flex-row justify-start gap-3 overflow-x-auto p-1 md:grid md:grid-cols-2">
          {examplePrompts?.slice(0, 6)?.map((prompt, index) => (
            <motion.div
              key={prompt.name}
              variants={slideUpVariant}
              className="w-full"
            >
              <Button
                key={index}
                variant="bordered"
                size="md"
                className="w-full justify-start gap-3 px-2"
                onClick={() => {
                  editor?.commands?.clearContent();
                  editor?.commands?.setContent(prompt.content);
                  editor?.commands?.focus("end");
                }}
              >
                <SentIcon
                  size={18}
                  className="rotate-45 text-emerald-400"
                  variant="solid"
                  strokeWidth="2"
                />
                {prompt.name}
              </Button>
            </motion.div>
          ))}
        </div>
      </StaggerContainer>
    </Flex>
  );
};
