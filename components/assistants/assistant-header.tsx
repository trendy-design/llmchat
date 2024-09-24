import { Button, Flex } from "@/ui";
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
      className="w-full py-2"
    >
      <Button
        className="w-full"
        onClick={() => {
          setOpenCreateAssistant(true);
        }}
      >
        Add New
      </Button>
    </Flex>
  );
};
