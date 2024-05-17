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
import { TRenderMessageProps } from "./chat-messages";
import { Button } from "./ui/button";
import Spinner from "./ui/loading-spinner";
import { Tooltip } from "./ui/tooltip";

export const AIMessageBubble = (props: TRenderMessageProps) => {
  const { id, humanMessage, aiMessage, loading, model } = props;

  console.log(props);
  const messageRef = useRef<HTMLDivElement>(null);

  const { showCopied, copy } = useClipboard();
  const { getModelByKey } = useModelList();
  const { renderMarkdown } = useMarkdown();
  const { removeMessage } = useChatContext();

  const modelForMessage = getModelByKey(model);

  const handleCopyContent = () => {
    messageRef?.current && aiMessage && copy(aiMessage);
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

  const tokenCount = getTokenCount({ model, rawAI: aiMessage });

  return (
    <div
      ref={messageRef}
      className="bg-white/5 rounded-2xl px-4 w-full border border-white/5 flex flex-col items-start"
    >
      {aiMessage && (
        <div className="pt-4 pb-2">
          {renderMarkdown(aiMessage, id === "streaming")}
        </div>
      )}

      <div className="flex flex-row w-full justify-between items-center py-3 opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-zinc-500 text-xs py-1/2 gap-4 flex flex-row items-center">
          <span className="flex flex-row gap-2 items-center">
            {" "}
            {modelForMessage?.icon()}
            {loading ? <Spinner /> : modelForMessage?.name}{" "}
          </span>
          {tokenCount && (
            <Tooltip content="Estimated Output Tokens">
              <span className="flex flex-row gap-1 p-2 items-center cursor-pointer">
                {`${tokenCount} tokens`}
                <Info size={14} weight="bold" />
              </span>
            </Tooltip>
          )}
        </p>
        {!loading && (
          <div className="flex flex-row gap-1">
            <Tooltip content="Copy">
              <Button
                variant="ghost"
                size="iconSm"
                rounded="lg"
                onClick={handleCopyContent}
              >
                {showCopied ? (
                  <Check size={16} weight="regular" />
                ) : (
                  <Copy size={16} weight="regular" />
                )}
              </Button>
            </Tooltip>
            <Tooltip content="Regenerate">
              <Button variant="ghost" size="iconSm" rounded="lg">
                <ArrowClockwise size={16} weight="regular" />
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
                <TrashSimple size={16} weight="regular" />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};
