import { RegenerateWithModelSelect } from "@/components/regenerate-model-select";
import {
  Button,
  Flex,
  PopOverConfirmProvider,
  Spinner,
  Tooltip,
  Type,
} from "@/components/ui";
import { Copy01Icon, Delete01Icon, Tick01Icon } from "@/components/ui/icons";
import { useChatContext, useSessions } from "@/context";
import { useAssistantUtils, useClipboard } from "@/hooks";
import { useLLMRunner } from "@/hooks/use-llm-runner";
import { TChatMessage } from "@/types";
import { FC } from "react";

export type TAIMessageActions = {
  message: TChatMessage;
  canRegenerate: boolean;
};

export const AIMessageActions: FC<TAIMessageActions> = ({
  message,
  canRegenerate,
}) => {
  const { refetch, store } = useChatContext();
  const { getAssistantByKey } = useAssistantUtils();
  const { invokeModel } = useLLMRunner();
  const { removeMessageByIdMutation } = useSessions();

  const { tools, runConfig, isLoading, rawAI } = message;
  const isToolRunning = !!tools?.filter((t) => !!t?.toolLoading)?.length;
  const isGenerating = isLoading && !isToolRunning;

  const { showCopied, copy } = useClipboard();
  const handleCopyContent = () => {
    const doc = document.getElementById(`message-${message.id}`);
    if (doc) {
      copy(doc.innerText);
    }
  };

  const handleRegenerate = (assistant: string) => {
    const props = getAssistantByKey(assistant);
    if (!props?.assistant) {
      return;
    }

    invokeModel({
      ...message.runConfig,
      messageId: message.id,
      assistant: props.assistant,
    });
  };

  return (
    <Flex
      justify="between"
      items="center"
      className="w-full opacity-100 transition-opacity"
    >
      {isGenerating && (
        <Flex gap="sm" items="center" className="py-1">
          <Spinner />
          <Type size="sm" textColor="tertiary">
            {!!rawAI?.length ? "Typing ..." : "Thinking ..."}
          </Type>
        </Flex>
      )}
      {!isLoading && (
        <div className="flex flex-row gap-1">
          <Tooltip content="Copy">
            <Button
              variant="ghost"
              size="iconSm"
              rounded="lg"
              onClick={handleCopyContent}
            >
              {showCopied ? (
                <Tick01Icon size={18} variant="stroke" strokeWidth="2" />
              ) : (
                <Copy01Icon size={18} variant="stroke" strokeWidth="2" />
              )}
            </Button>
          </Tooltip>

          <Tooltip content="Delete">
            <PopOverConfirmProvider
              title="Are you sure you want to delete this message?"
              confimBtnVariant="destructive"
              onConfirm={() => {
                removeMessageByIdMutation.mutate(
                  {
                    parentId: message.parentId,
                    messageId: message.id,
                  },
                  {
                    onSuccess: () => {
                      refetch();
                    },
                  },
                );
              }}
            >
              <Button variant="ghost" size="iconSm" rounded="lg">
                <Delete01Icon size={18} variant="stroke" strokeWidth="2" />
              </Button>
            </PopOverConfirmProvider>
          </Tooltip>
          {canRegenerate && (
            <RegenerateWithModelSelect
              assistant={runConfig?.assistant}
              onRegenerate={handleRegenerate}
            />
          )}
        </div>
      )}
    </Flex>
  );
};
