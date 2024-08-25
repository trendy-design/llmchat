import { Button, Flex, Type } from "@/ui";
import { FC } from "react";

export type AssistantHeaderProps = {
  openCreateAssistant: boolean;
  setOpenCreateAssistant: (open: boolean) => void;
};

export const AssistantHeader: FC<AssistantHeaderProps> = ({
  openCreateAssistant,
  setOpenCreateAssistant,
}) => {
  return (
    <Flex
      items="center"
      direction="row"
      justify="between"
      gap="md"
      className="w-full px-2 py-2"
    >
      <Flex direction="col" gap="sm">
        <Flex items="center" gap="xs">
          <Type weight="medium" size="sm">
            Custom Assistant
          </Type>
        </Flex>
      </Flex>

      <Button
        size="sm"
        onClick={() => {
          setOpenCreateAssistant(true);
        }}
      >
        Add New
      </Button>
    </Flex>
  );
};
