import { Flex, Type } from "@/ui";
import { MessageSquareQuote } from "lucide-react";
import { ToolBadge } from "../tools/tool-badge";

export type ContextMessageProps = {
  context?: string;
};

export const ContextMessage = ({ context }: ContextMessageProps) => {
  if (!context) return null;

  return (
    <Flex direction="col" gap="sm">
      <ToolBadge icon={MessageSquareQuote} text="context" />
      <Type className="text-left" size="sm" textColor="secondary">
        {context}
      </Type>
    </Flex>
  );
};
