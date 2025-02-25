import { TAttachment } from '@repo/shared/types';
import { Button, Flex } from '@repo/ui';
import { X } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';

export type TImageAttachment = {
  attachment?: TAttachment;
  clearAttachment: () => void;
};

export const ImageAttachment: FC<TImageAttachment> = ({ attachment, clearAttachment }) => {
  if (!attachment?.base64) return null;

  return (
    <Flex className="pl-2 pr-2 pt-2 md:pl-3" gap="sm">
      <div className="relative h-[60px] min-w-[60px] rounded-lg border border-border shadow-sm">
        <Image
          src={attachment.base64}
          alt="uploaded image"
          className="h-full w-full overflow-hidden object-cover"
          width={0}
          height={0}
        />

        <Button
          size={'icon-xs'}
          variant="default"
          onClick={clearAttachment}
          className="absolute right-[-4px] top-[-4px] z-10 h-4 w-4 flex-shrink-0"
        >
          <X size={12} strokeWidth={2} />
        </Button>
      </div>
    </Flex>
  );
};
