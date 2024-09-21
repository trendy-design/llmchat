import { useRef } from "react";

import { Flex } from "@/components/ui";
import { Mdx } from "@/components/ui/mdx";
import { useChatContext } from "@/lib/context";
import { useAssistantUtils } from "@/lib/hooks";
import { TChatMessage } from "@/lib/types";
import { AIMessageActions } from "./ai-message-actions";
import { AIMessageError } from "./ai-message-error";
import { AIRelatedQuestions } from "./ai-related-questions";
import { AISelectionProvider } from "./ai-selection-provider";
import { AIToolMessage } from "./ai-tool-message";

export type TAIMessage = {
  message: TChatMessage;
  isLast: boolean;
};

export const AIMessage = ({ message, isLast }: TAIMessage) => {
  const { id, isLoading, stopReason, tools, runConfig, stop, rawAI } = message;

  const { store } = useChatContext();
  const editor = store((state) => state.editor);
  const setContextValue = store((state) => state.setContext);
  const messageRef = useRef<HTMLDivElement>(null);
  const { getAssistantIcon } = useAssistantUtils();

  const handleSelection = (value: string) => {
    setContextValue(value);
    editor?.commands.clearContent();
    editor?.commands.focus("end");
  };

  return (
    <div className="mt-2 flex w-full flex-row items-start justify-start gap-3">
      <Flex className="flex-shrink-0">
        {getAssistantIcon(runConfig.assistant.key, "sm")}
      </Flex>
      <Flex
        ref={messageRef}
        direction="col"
        gap="lg"
        items="start"
        className="min-w-0 flex-grow pb-8"
      >
        {!!tools?.length && (
          <Flex className="w-full gap-1 pb-2" direction="col">
            {tools?.map((tool) => (
              <AIToolMessage tool={tool} key={tool.toolName} />
            ))}
          </Flex>
        )}

        <AISelectionProvider onSelect={handleSelection}>
          <Mdx
            message={rawAI ?? undefined}
            animate={!!isLoading}
            messageId={id}
          />
        </AISelectionProvider>
        {stop && (
          <AIMessageError
            stopReason={stopReason ?? undefined}
            message={message}
          />
        )}
        <AIMessageActions message={message} canRegenerate={message && isLast} />
        <AIRelatedQuestions message={message} show={message && isLast} />
      </Flex>
    </div>
  );
};
