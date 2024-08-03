import { Button } from "@/components/ui/button";
import { TAttachment } from "@/types";
import { Cancel01Icon } from "@hugeicons/react";
import Image from "next/image";
import { FC } from "react";
import { Flex } from "../ui";

export type TImageAttachment = {
  attachment?: TAttachment;
  clearAttachment: () => void;
};

export const ImageAttachment: FC<TImageAttachment> = ({
  attachment,
  clearAttachment,
}) => {
  if (!attachment?.base64) return null;

  return (
    <Flex className="pl-2 pr-2 pt-2 md:pl-3" gap="sm">
      <div className="relative h-[60px] min-w-[60px] rounded-lg border border-black/10 shadow-md dark:border-white/10">
        <Image
          src={attachment.base64}
          alt="uploaded image"
          className="h-full w-full overflow-hidden rounded-lg object-cover"
          width={0}
          height={0}
        />

        <Button
          size={"iconXS"}
          variant="default"
          onClick={clearAttachment}
          className="absolute right-[-4px] top-[-4px] z-10 h-4 w-4 flex-shrink-0"
        >
          <Cancel01Icon size={12} strokeWidth={2} />
        </Button>
      </div>
    </Flex>
  );
};
