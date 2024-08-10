"use client";
import { Flex } from "@/components/ui";
import { Mdx } from "@/components/ui/mdx";
import { privacyPolicy } from "@/config/privacy";

const PrivacyPage = () => {
  return (
    <Flex className="w-full" justify="center">
      <Flex className="w-full py-12 md:max-w-[600px]">
        <Mdx
          message={privacyPolicy}
          animate={false}
          messageId="privacy"
          size="sm"
        />
      </Flex>
    </Flex>
  );
};

export default PrivacyPage;
