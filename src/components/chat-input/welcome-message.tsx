import { ModelIcon } from "../model-icon";
import { Flex, Type } from "../ui";

export type TWelcomeMessageProps = {
  show: boolean;
};

export const WelcomeMessage = ({ show }: TWelcomeMessageProps) => {
  if (!show) return null;

  return (
    <div className="flex w-full flex-row items-start justify-start gap-2 rounded-xl border border-zinc-500/10 bg-white shadow-sm dark:bg-zinc-700 md:w-[720px]">
      <div className="flex w-full flex-col items-start p-2 md:flex-row">
        <div className="p-2 md:px-2 md:py-2">
          <ModelIcon type="llmchat" size="sm" />
        </div>
        <Flex
          direction="col"
          gap="none"
          items="start"
          className="w-full flex-1 overflow-hidden p-1"
        >
          <Type size="sm">
            Welcome to LLMChat! All of your chats are private, stored locally in
            your browser and not used to train AI models.
          </Type>
        </Flex>
      </div>
    </div>
  );
};
