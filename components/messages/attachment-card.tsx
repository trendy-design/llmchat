import { useTokenCounter } from "@/libs/hooks/use-token-counter";
import { TFileAttachment } from "@/types";
import { Button, Flex, Type } from "@/ui";
import { FileText, X } from "lucide-react";

export type TAttachmentCard = {
  attachment?: TFileAttachment;
  onClear?: () => void;
};

export const AttachmentCard = ({ attachment, onClear }: TAttachmentCard) => {
  const { getTokenCount } = useTokenCounter();

  if (!attachment) return null;
  if (!attachment.attachmentContent) return null;
  const fileName = attachment?.attachmentName;
  const fileSize = (attachment?.attachmentSize ?? 0 / 1024).toFixed(2); // size in KB

  return (
    <Flex className="pl-2 pr-2 pt-2 md:pl-3" gap="sm">
      <div className="relative flex items-center justify-center rounded-md bg-zinc-500/10 p-2">
        <Flex gap="xs">
          <FileText size={16} />
          <Flex direction="col">
            <Type>{fileName}</Type>
            <Flex direction="row" gap="xs">
              <Type size="xxs" textColor="secondary">
                {fileSize} KB
              </Type>
            </Flex>
          </Flex>
        </Flex>
        {onClear && (
          <Button
            size={"iconXS"}
            variant="default"
            onClick={onClear}
            className="absolute right-[-4px] top-[-4px] z-10 h-4 w-4 flex-shrink-0"
          >
            <X size={12} strokeWidth={2} />
          </Button>
        )}
      </div>
    </Flex>
  );
};
