import { useChatContext, usePreferenceContext } from "@/lib/context";
import { useAssistantUtils, useLLMRunner } from "@/lib/hooks";
import { TChatMessage } from "@/lib/types";
import { slideUpVariant } from "@/lib/utils/animations";
import { Flex, StaggerContainer, Type } from "@/ui";
import { ArrowRight02Icon, RepeatIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import { FC } from "react";
import { ToolBadge } from "../../tools/tool-badge";

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

  if (
    !Array.isArray(message?.relatedQuestions) ||
    !message?.relatedQuestions?.length ||
    !show ||
    isGenerating
  ) {
    return null;
  }

  return (
    <StaggerContainer>
      <Flex
        direction="col"
        gap="sm"
        className="mt-4 w-full border-t border-zinc-500/10 pt-8"
      >
        <ToolBadge icon={RepeatIcon} text={"Related"} />
        {message?.relatedQuestions?.map((question) => {
          return (
            <motion.div key={question} variants={slideUpVariant}>
              <Type
                className="cursor-pointer items-center gap-2 py-0.5 decoration-zinc-500 underline-offset-4 opacity-70 hover:underline hover:opacity-100"
                size="sm"
                onClick={() => handleOnClick(question)}
                weight="medium"
              >
                <ArrowRight02Icon size={16} strokeWidth={2} />
                {question}
              </Type>
            </motion.div>
          );
        })}
      </Flex>
    </StaggerContainer>
  );
};
