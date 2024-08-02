import { Button, Flex, Type } from "@/components/ui";
import { useChatContext, usePreferenceContext } from "@/context";
import { useAssistantUtils } from "@/hooks";
import { useLLMRunner } from "@/hooks/use-llm-runner";
import { TChatMessage } from "@/types";
import { MessageQuestionIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import { FC } from "react";

export type TAIRelatedQuestions = {
  message: TChatMessage;
  show: boolean;
};

export const AIRelatedQuestions: FC<TAIRelatedQuestions> = ({
  message,
  show,
}) => {
  const { refetch, store } = useChatContext();
  const isGenerating = store((state) => state.isGenerating);
  const { preferences } = usePreferenceContext();
  const { getAssistantByKey } = useAssistantUtils();
  const { invokeModel } = useLLMRunner();

  const handleOnClick = (question: string) => {
    const assistant = preferences.defaultAssistant;

    const props = getAssistantByKey(assistant);
    if (!props?.assistant) {
      return;
    }
    invokeModel({
      input: question,
      sessionId: message.sessionId,
      assistant: props.assistant,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (
    !Array.isArray(message?.relatedQuestions) ||
    !message?.relatedQuestions?.length ||
    !show ||
    isGenerating
  ) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={containerVariants}
    >
      <Flex direction="col" gap="sm" className="w-full pt-6">
        <Type
          size="sm"
          weight="medium"
          textColor="secondary"
          className="items-center gap-2 py-1"
        >
          <MessageQuestionIcon size={20} variant="solid" /> Related
        </Type>
        {message?.relatedQuestions?.map((question) => {
          return (
            <motion.div key={question} variants={itemVariants}>
              <Button
                size="sm"
                className="h-auto text-wrap py-2 text-left"
                variant="secondary"
                onClick={() => handleOnClick(question)}
              >
                {question}
              </Button>
            </motion.div>
          );
        })}
      </Flex>
    </motion.div>
  );
};
