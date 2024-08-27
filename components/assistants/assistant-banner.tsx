import { Button, Flex, Type } from "@/ui";
import { Plus, Sparkle } from "lucide-react";
import { FC } from "react";

export type AssistantBannerProps = {
  openCreateAssistant: boolean;
  setOpenCreateAssistant: (open: boolean) => void;
};

export const AssistantBanner: FC<AssistantBannerProps> = ({
  setOpenCreateAssistant,
}) => {
  return (
    <Flex
      items="start"
      direction="col"
      gap="md"
      className="w-full bg-zinc-800/5 p-4 dark:bg-white/5"
    >
      <Flex direction="col" gap="sm">
        <Flex items="center" gap="sm" className="!text-teal-600">
          <Sparkle size={20} />

          <Type weight="medium" size="base">
            Custom Assistant
          </Type>
        </Flex>
        <Type size="sm" textColor="secondary">
          Customize a version of the model to fit your needs
        </Type>
      </Flex>

      <Button
        size="sm"
        onClick={() => {
          setOpenCreateAssistant(true);
        }}
      >
        <Plus size={16} strokeWidth={2} /> Create Assistant
      </Button>
    </Flex>
  );
};
