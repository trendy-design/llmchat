import { useRef } from "react";

import { ToolBadge } from "@/components/tools/tool-badge";
import { Flex } from "@/components/ui";
import { Mdx } from "@/components/ui/mdx";
import { useChatContext } from "@/lib/context";
import { useAssistantUtils } from "@/lib/hooks";
import { TChatMessage } from "@/lib/types";
import { BookOpenText } from "lucide-react";
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
      {/* <Tooltip content={runConfig.assistant.name}>
        <div className="p-2 md:px-3 md:py-2">
          {getAssistantIcon(runConfig.assistant.key, "sm")}
        </div>
      </Tooltip> */}

      <Flex
        ref={messageRef}
        direction="col"
        gap="xs"
        items="start"
        className="w-full flex-1"
      >
        {tools?.map((tool) => (
          <AIToolMessage tool={tool} key={tool.toolName} />
        ))}
        {rawAI && <ToolBadge icon={BookOpenText} text={"Answer"} />}

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
