"use client";
import { Mdx } from "@/components/mdx";
import { termsMdx } from "@repo/shared/config";
import { Flex } from "@repo/ui";

const TermsPage = () => {
  return (
    <Flex className="w-full" justify="center">
      <Flex className="w-full py-12 md:max-w-[600px]">
        <Mdx message={termsMdx} animate={false} messageId="terms" size="sm" />
      </Flex>
    </Flex>
  );
};

export default TermsPage;
