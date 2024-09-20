import { useChatContext, usePreferenceContext, useSessions } from "@/context";
import { useAssistantUtils, useClipboard, useLLMRunner } from "@/hooks";
import { TChatMessage } from "@/libs/types";
import {
  Button,
  Flex,
  PopOverConfirmProvider,
  Spinner,
  Tooltip,
  Type,
} from "@/ui";
import { Check, Copy, Trash } from "lucide-react";
import { FC } from "react";
import { RegenerateWithModelSelect } from "../../regenerate-model-select";

export type TAIMessageActions = {
  message: TChatMessage;
  canRegenerate: boolean;
};

export const AIMessageActions: FC<TAIMessageActions> = ({
  message,
  canRegenerate,
}) => {
  const { updatePreferences } = usePreferenceContext();
  const { refetch, store } = useChatContext();
  const currentMessageId = store((state) => state.currentMessage?.id);
  const setCurrentMessage = store((state) => state.setCurrentMessage);
  const { getAssistantByKey } = useAssistantUtils();
  const { invokeModel } = useLLMRunner();
  const { removeMessageByIdMutation } = useSessions();

  const { tools, runConfig, isLoading, rawAI } = message;
  const isToolRunning = !!tools?.filter((t) => !!t?.isLoading)?.length;
  const isGenerating = isLoading && !isToolRunning;
  const removeLastMessage = store((state) => state.removeLastMessage);

  const { showCopied, copy } = useClipboard();
  const handleCopyContent = () => {
    const doc = document.getElementById(`message-${message.id}`);
    if (doc) {
      copy(doc.innerText);
    }
  };

  const handleDeleteMessage = () => {
    message.parentId &&
      removeMessageByIdMutation.mutate(
        {
          parentId: message.parentId,
          messageId: message.id,
        },
        {
          onSettled: () => {
            if (currentMessageId === message.id) {
              setCurrentMessage(undefined);
            } else {
              removeLastMessage();
            }
            refetch();
          },
        },
      );
  };

  const handleRegenerate = (assistant: string) => {
    const props = getAssistantByKey(assistant);
    if (!props?.assistant) {
      return;
    }

    updatePreferences({
      defaultAssistant: assistant,
    });

    if (currentMessageId !== message.id) {
      removeLastMessage();
    }
    setCurrentMessage(undefined);

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
        <Flex gap="sm" items="center">
          <Spinner />
          <Type size="sm" textColor="tertiary">
            {!!rawAI?.length ? "Typing ..." : "Thinking ..."}
          </Type>
        </Flex>
      )}
      {!isLoading && (
        <Flex gap="xs" items="center" className="w-full">
          <Tooltip content="Copy">
            <Button
              variant="secondary"
              size="sm"
              rounded="lg"
              onClick={handleCopyContent}
            >
              {showCopied ? (
                <Check size={14} strokeWidth="2" />
              ) : (
                <Copy size={14} strokeWidth="2" />
              )}
              Copy
            </Button>
          </Tooltip>

          <Tooltip content="Delete">
            <PopOverConfirmProvider
              title="Are you sure you want to delete this message?"
              confimBtnVariant="destructive"
              onConfirm={handleDeleteMessage}
            >
              <Button variant="secondary" size="sm" rounded="lg">
                <Trash size={14} strokeWidth="2" />
                Delete
              </Button>
            </PopOverConfirmProvider>
          </Tooltip>
          {canRegenerate ? (
            <RegenerateWithModelSelect
              assistant={runConfig?.assistant}
              onRegenerate={handleRegenerate}
            />
          ) : (
            <Type size="sm" textColor="tertiary" className="px-2">
              {message.runConfig?.assistant?.name}
            </Type>
          )}
        </Flex>
      )}
    </Flex>
  );
};
