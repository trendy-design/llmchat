import { useChatContext } from "@/context/chat/context";
import { useSettings } from "@/context/settings/context";
import { TChatMessage } from "@/hooks/use-chat-session";
import { useClipboard } from "@/hooks/use-clipboard";
import { useMarkdown } from "@/hooks/use-mdx";
import { TModelKey, useModelList } from "@/hooks/use-model-list";
import { useTokenCounter } from "@/hooks/use-token-counter";
import { Check, Copy, TrashSimple } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { RegenerateWithModelSelect } from "./regenerate-model-select";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import Spinner from "./ui/loading-spinner";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Tooltip } from "./ui/tooltip";

export type TAIMessageBubble = {
  chatMessage: TChatMessage;
  isLast: boolean;
};

export const AIMessageBubble = ({ chatMessage, isLast }: TAIMessageBubble) => {
  const { id, rawAI, isLoading, model, errorMesssage } = chatMessage;
  const messageRef = useRef<HTMLDivElement>(null);
  const { showCopied, copy } = useClipboard();
  const { getModelByKey } = useModelList();
  const { renderMarkdown } = useMarkdown();
  const { open: openSettings } = useSettings();
  const { getTokenCount } = useTokenCounter();
  const { removeMessage, runModel } = useChatContext();
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const modelForMessage = getModelByKey(model);

  const handleCopyContent = () => {
    messageRef?.current && rawAI && copy(rawAI);
  };

  return (
    <div className="flex  flex-col md:flex-row gap-2 mt-6 w-full">
      <div className="px-0 md:px-3 py-1">{modelForMessage?.icon()}</div>
      <div
        ref={messageRef}
        className=" rounded-2xl w-full flex flex-col items-start"
      >
        {rawAI && (
          <div className="pb-2 w-full">{renderMarkdown(rawAI, isLoading)}</div>
        )}
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

        <div className="flex flex-row w-full justify-between items-center py-3 opacity-70 hover:opacity-100 transition-opacity">
          {isLoading && <Spinner />}
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
                    <Check size={16} weight="bold" />
                  ) : (
                    <Copy size={16} weight="bold" />
                  )}
                </Button>
              </Tooltip>
              {chatMessage && isLast && (
                <RegenerateWithModelSelect
                  onRegenerate={(model: TModelKey) => {
                    runModel({
                      messageId: chatMessage.id,
                      model: model,
                      props: chatMessage.props,
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
                    <p className="text-sm font-medium pb-2">
                      Are you sure you want to delete this message?
                    </p>
                    <div className="flex flex-row gap-1">
                      <Button
                        variant="default"
                        className="bg-red-600 hover:bg-red-700"
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
          {!isLoading && (
            <div className="flex flex-row gap-2 items-center text-xs text-zinc-500">
              {modelForMessage?.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
