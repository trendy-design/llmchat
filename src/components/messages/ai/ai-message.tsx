import { useRef } from "react";

import { Mdx } from "@/components/mdx";
import { Flex, Tooltip } from "@/components/ui";
import { useChatContext } from "@/context";
import { useAssistantUtils } from "@/hooks";
import { TChatMessage } from "@/types";
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
    <div className="mt-6 flex w-full flex-col items-start md:flex-row">
      <div className="p-2 md:px-3 md:py-2">
        <Tooltip content={runConfig.assistant.name}>
          {getAssistantIcon(runConfig.assistant.key, "sm")}
        </Tooltip>
      </div>
      <Flex
        ref={messageRef}
        direction="col"
        gap="none"
        items="start"
        className="w-full flex-1 overflow-hidden p-2"
      >
        {tools?.map((tool) => (
          <AIToolMessage tool={tool} key={tool.toolName} />
        ))}

        <AISelectionProvider onSelect={handleSelection}>
          <Mdx message={rawAI} animate={!!isLoading} messageId={id} />
        </AISelectionProvider>
        {stop && <AIMessageError stopReason={stopReason} message={message} />}
        <AIMessageActions message={message} canRegenerate={message && isLast} />
        <AIRelatedQuestions message={message} show={message && isLast} />
      </Flex>
    </div>
  );
};
