import { useChatContext } from "@/context/chat/context";
import { TChatMessage } from "@/hooks/use-chat-session";
import { useClipboard } from "@/hooks/use-clipboard";
import { useMarkdown } from "@/hooks/use-mdx";
import { useModelList } from "@/hooks/use-model-list";
import {
  ArrowClockwise,
  Check,
  Copy,
  Info,
  TrashSimple,
} from "@phosphor-icons/react";
import { encodingForModel } from "js-tiktoken";
import { useRef } from "react";
import { Button } from "./ui/button";
import Spinner from "./ui/loading-spinner";
import { Tooltip } from "./ui/tooltip";

export const AIMessageBubble = (props: TChatMessage) => {
  const { id, rawAI, isLoading, model } = props;
  const messageRef = useRef<HTMLDivElement>(null);
  const { showCopied, copy } = useClipboard();
  const { getModelByKey } = useModelList();
  const { renderMarkdown } = useMarkdown();
  const { removeMessage } = useChatContext();

  const modelForMessage = getModelByKey(model);

  const handleCopyContent = () => {
    messageRef?.current && rawAI && copy(rawAI);
  };

  const getTokenCount = (
    message: Partial<Pick<TChatMessage, "model" | "rawAI">>
  ) => {
    const enc = encodingForModel("gpt-3.5-turbo");

    if (message.rawAI) {
      return enc.encode(message.rawAI).length;
    }
    return undefined;
  };

  const tokenCount = getTokenCount({ model, rawAI });

  return (
    <div className="flex flex-row gap-2 mt-6 w-full">
      <div className="p-3">{modelForMessage?.icon()}</div>
      <div
        ref={messageRef}
        className=" rounded-2xl w-full flex flex-col items-start"
      >
        {rawAI && (
          <div className="pb-2 w-full">{renderMarkdown(rawAI, isLoading)}</div>
        )}

        <div className="flex flex-row w-full justify-between items-center py-3 opacity-50 hover:opacity-100 transition-opacity">
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
              <Tooltip content="Regenerate">
                <Button variant="ghost" size="iconSm" rounded="lg">
                  <ArrowClockwise size={16} weight="bold" />
                </Button>
              </Tooltip>
              <Tooltip content="Delete">
                <Button
                  variant="ghost"
                  size="iconSm"
                  rounded="lg"
                  onClick={() => {
                    removeMessage(id);
                  }}
                >
                  <TrashSimple size={16} weight="bold" />
                </Button>
              </Tooltip>
            </div>
          )}
          {tokenCount && !isLoading && (
            <div className="flex flex-row gap-2 items-center text-xs text-zinc-500">
              {modelForMessage?.name}
              <Tooltip content="Estimated Output Tokens">
                <span className="flex flex-row gap-1 p-2 items-center text-xs cursor-pointer">
                  {`${tokenCount} tokens`}
                  <Info size={14} weight="bold" />
                </span>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
