'use client';
import { Mdx } from '@/components/mdx';
import { privacyPolicy } from '@repo/shared/config';
import { Flex } from '@repo/ui';

const PrivacyPage = () => {
  return (
    <Flex className="w-full" justify="center">
      <Flex className="w-full py-12 md:max-w-[600px]">
        <Mdx message={privacyPolicy} animate={false} messageId="privacy" size="sm" />
      </Flex>
    </Flex>
  );
};

export default PrivacyPage;
