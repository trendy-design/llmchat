import { Button, Flex, Type } from "@/components/ui";
import { Add01Icon, SparklesIcon } from "@hugeicons/react";
import { FC } from "react";

export type AssistantBannerProps = {
  openCreateAssistant: boolean;
  setOpenCreateAssistant: (open: boolean) => void;
};

export const AssistantBanner: FC<AssistantBannerProps> = ({
  openCreateAssistant,
  setOpenCreateAssistant,
}) => {
  return (
    <Flex
      items="start"
      direction="col"
      gap="md"
      className="w-full rounded-xl bg-white/5 p-4"
    >
      <Flex direction="col" gap="sm">
        <Flex items="center" gap="sm" className="!text-emerald-500">
          <SparklesIcon size={20} />

          <Type weight="medium" size="base">
            Custom Assistant
          </Type>
        </Flex>
        <Type size="sm" textColor="secondary">
          Experience the advanced capabilities of AI with Custom Assistants
        </Type>
      </Flex>

      <Button
        size="sm"
        onClick={() => {
          setOpenCreateAssistant(true);
        }}
      >
        <Add01Icon size={16} /> Create your own assistant{" "}
      </Button>
    </Flex>
  );
};
