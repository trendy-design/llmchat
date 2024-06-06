import { useChatContext } from "@/context/chat/provider";
import { useSessionsContext } from "@/context/sessions/provider";
import { useSettings } from "@/context/settings/context";
import { TChatMessage } from "@/hooks/use-chat-session";
import { useClipboard } from "@/hooks/use-clipboard";
import { useMarkdown } from "@/hooks/use-mdx";
import { TModelKey, useModelList } from "@/hooks/use-model-list";
import { TToolKey, useTools } from "@/hooks/use-tools";
import { Check, Copy, TrashSimple } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { RegenerateWithModelSelect } from "./regenerate-model-select";
import { Alert, AlertDescription } from "./ui/alert";
import { BotAvatar } from "./ui/bot-avatar";
import { Button } from "./ui/button";
import { Flex } from "./ui/flex";
import Spinner from "./ui/loading-spinner";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Type } from "./ui/text";
import { Tooltip } from "./ui/tooltip";

export type TAIMessageBubble = {
  chatMessage: TChatMessage;
  isLast: boolean;
};

export const AIMessageBubble = ({ chatMessage, isLast }: TAIMessageBubble) => {
  const {
    id,
    rawAI,
    isLoading,
    model,
    errorMesssage,
    isToolRunning,
    toolName,
  } = chatMessage;

  const { getToolInfoByKey } = useTools();

  const toolUsed = toolName
    ? getToolInfoByKey(toolName as TToolKey)
    : undefined;
  const messageRef = useRef<HTMLDivElement>(null);
  const { showCopied, copy } = useClipboard();
  const { getModelByKey } = useModelList();
  const { renderMarkdown, links } = useMarkdown();
  const { open: openSettings } = useSettings();
  const { removeMessage, currentSession } = useSessionsContext();
  const { handleRunModel } = useChatContext();
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const modelForMessage = getModelByKey(model);

  const handleCopyContent = () => {
    messageRef?.current && rawAI && copy(rawAI);
  };

  return (
    <div className="flex flex-col md:flex-row mt-6 w-full">
      <div className="p-0 md:p-3">
        {currentSession?.bot ? (
          <BotAvatar
            size="small"
            name={currentSession?.bot?.name}
            avatar={currentSession?.bot?.avatar}
          />
        ) : (
          modelForMessage?.icon()
        )}
      </div>
      <Flex
        ref={messageRef}
        direction="col"
        gap="md"
        items="start"
        className="w-full p-4 rounded-2xl dark:hover:bg-white/5 hover:bg-zinc-50/50"
      >
        {toolUsed && (
          <Type
            size="xs"
            className="flex flex-row gap-2 items-center"
            textColor="tertiary"
          >
            {toolUsed.smallIcon()}
            {isToolRunning ? (
              <span>{toolUsed.loadingMessage}</span>
            ) : (
              <span>{toolUsed.resultMessage}</span>
            )}
          </Type>
        )}

        {rawAI && renderMarkdown(rawAI, !!isLoading, id)}
        {errorMesssage && (
          <Alert variant="destructive">
            <AlertDescription>
              Something went wrong. Make sure your API key is working.
              <Button
                variant="link"
                size="link"
                onClick={() => {
                  openSettings();
                }}
              >
                Check API Key
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Flex
          justify="between"
          items="center"
          className="w-full pt-3 opacity-70 hover:opacity-100 transition-opacity"
        >
          {isLoading && !isToolRunning && <Spinner />}
          {!isLoading && !isToolRunning && (
            <div className="flex flex-row gap-1">
              <Tooltip content="Copy">
                <Button
                  variant="ghost"
                  size="iconSm"
                  rounded="lg"
                  onClick={handleCopyContent}
                >
                  {showCopied ? (
                    <Check size={16} weight="bold" />
                  ) : (
                    <Copy size={16} weight="bold" />
                  )}
                </Button>
              </Tooltip>
              {chatMessage && isLast && (
                <RegenerateWithModelSelect
                  onRegenerate={(model: TModelKey) => {
                    handleRunModel({
                      input: chatMessage.rawHuman,
                      messageId: chatMessage.id,
                      model: model,
                      sessionId: chatMessage.sessionId,
                    });
                  }}
                />
              )}
              <Tooltip content="Delete">
                <Popover
                  open={openDeleteConfirm}
                  onOpenChange={setOpenDeleteConfirm}
                >
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="iconSm" rounded="lg">
                      <TrashSimple size={16} weight="bold" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <p className="text-sm md:text-base font-medium pb-2">
                      Are you sure you want to delete this message?
                    </p>
                    <div className="flex flex-row gap-1">
                      <Button
                        variant="destructive"
                        onClick={() => {
                          removeMessage(id);
                        }}
                      >
                        Delete Message
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setOpenDeleteConfirm(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </Tooltip>
            </div>
          )}
          {!isLoading && !isToolRunning && (
            <div className="flex flex-row gap-2 items-center text-xs text-zinc-500">
              {modelForMessage?.name}
            </div>
          )}
        </Flex>
      </Flex>
    </div>
  );
};
