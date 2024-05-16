import { useChatContext } from "@/context/chat/context";
import { useClipboard } from "@/hooks/use-clipboard";
import { useMarkdown } from "@/hooks/use-mdx";
import { useModelList } from "@/hooks/use-model-list";
import {
  ArrowClockwise,
  Check,
  Copy,
  TrashSimple,
} from "@phosphor-icons/react";
import { useRef } from "react";
import { TRenderMessageProps } from "./chat-messages";
import { Button } from "./ui/button";
import Spinner from "./ui/loading-spinner";

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
        <p className="text-zinc-500 text-xs py-1/2 gap-2 flex flex-row items-center">
          {modelForMessage?.icon()}
          {loading ? <Spinner /> : modelForMessage?.name}
        </p>
        {!loading && (
          <div className="flex flex-row gap-1">
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
            <Button variant="ghost" size="iconSm" rounded="lg">
              <ArrowClockwise size={16} weight="regular" />
            </Button>
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
          </div>
        )}
      </div>
    </div>
  );
};
