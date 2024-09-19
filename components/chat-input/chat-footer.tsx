import { Flex, Type } from "@/ui";

export const ChatFooter = () => {
  return (
    <Flex className="w-full px-4 py-1" justify="center" gap="xs">
      <Type size="xxs" textColor="tertiary">
        LLMChat is open source and your data is stored locally.
      </Type>
      <Type size="xxs" textColor="tertiary">
        project by{" "}
        <a
          href="https://trendy.design"
          target="_blank"
          className="ml-1 text-violet-500 underline decoration-zinc-500/20 underline-offset-2"
        >
          trendy.design
        </a>
      </Type>
    </Flex>
  );
};
