import { Flex } from '@repo/ui';
import Link from 'next/link';

export const ChatFooter = () => {
  return (
    <Flex className="w-full p-2" justify="center" gap="xs">
      <p className="text-xs opacity-50">
        LLMChat is open source and your data is stored locally. project by{' '}
        <Link
          href="https://trendy.design"
          target="_blank"
          className="text-brand decoration-brand inline-block underline underline-offset-2"
        >
          trendy.design
        </Link>
      </p>
    </Flex>
  );
};
