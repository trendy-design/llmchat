"use client";
import { termsMdx } from "@/config/terms";
import { Flex, Mdx } from "@/ui";

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
