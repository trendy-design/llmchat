import { Flex, Type } from "@/ui";
import GitHubButton from "react-github-btn";

export const ChatFooter = () => {
  return (
    <Flex
      className="absolute bottom-0 z-10 w-full px-4 py-2"
      justify="center"
      gap="sm"
    >
      <Type size="xxs" textColor="tertiary">
        LLMChat is open source{" "}
        <span className="inline-block px-1">
          <GitHubButton
            href="https://github.com/trendy-design/llmchat"
            data-color-scheme="no-preference: light; light: light; dark: dark;"
            aria-label="Star trendy-design/llmchat on GitHub"
          >
            Star
          </GitHubButton>{" "}
        </span>
        and your data is stored locally.
      </Type>
      <Type size="xxs" textColor="tertiary">
        project by{" "}
        <a
          href="https://trendy.design"
          target="_blank"
          className="ml-1 text-teal-600 underline decoration-zinc-500/20 underline-offset-2"
        >
          trendy.design
        </a>
      </Type>
    </Flex>
  );
};
