import { QuoteUpSquareIcon } from "@hugeicons/react";
import { ToolBadge } from "../tools/tool-badge";
import { Flex, Type } from "../ui";

export type ContextMessageProps = {
  context?: string;
};

export const ContextMessage = ({ context }: ContextMessageProps) => {
  if (!context) return null;

  return (
    <Flex direction="col" gap="sm">
      <ToolBadge icon={QuoteUpSquareIcon} text="context" />
      <Type className="text-left" size="sm" textColor="secondary">
        {context}
      </Type>
    </Flex>
  );
};
