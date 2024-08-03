import { ChatExamples } from "./chat-examples";
import { Mdx } from "./mdx";
import { ModelIcon } from "./model-icon";
import { Flex } from "./ui";

export const ChatGreeting = () => {
  return (
    <div className="flex w-full flex-row items-start justify-start gap-2 md:w-[720px]">
      <div className="mt-6 flex w-full flex-col items-start md:flex-row">
        <div className="p-2 md:px-3 md:py-2">
          <ModelIcon type="llmchat" size="sm" />
        </div>
        <Flex
          direction="col"
          gap="none"
          items="start"
          className="w-full flex-1 overflow-hidden p-2"
        >
          <Mdx
            message={`Welcome to AI Chat! All of your chats are private, stored locally and not used to train AI models.`}
            animate={true}
            messageId={"intro-message"}
          />
          <ChatExamples />
        </Flex>
      </div>
    </div>
  );
};
