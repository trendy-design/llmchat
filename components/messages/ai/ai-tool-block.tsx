import { cn } from "@/libs/utils/clsx";
import { ToolDefinition, ToolExecutionState } from "@/types";
import { Badge, Button, Flex, Type } from "@/ui";
import { CodeBlock } from "@/ui/codeblock";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type AiToolBlockProps = {
  tool: ToolExecutionState;
  definition: ToolDefinition;
};

export const AiToolBlock = ({ tool, definition }: AiToolBlockProps) => {
  const Icon = definition.compactIcon;
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Flex className="w-full pr-2" direction="col" gap="sm">
      <Flex gap="sm" className="w-full" items="center">
        <Flex gap="sm" items="center" className="w-full">
          <Flex
            items="center"
            justify="center"
            className="h-6 w-6 rounded-lg border border-zinc-500/10 bg-white dark:bg-zinc-700"
          >
            <Icon size={14} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
          </Flex>
          <Flex direction="col" gap="xs" className="w-full flex-1">
            <Type size="sm" weight="medium">
              {tool.isLoading
                ? definition.loadingMessage
                : definition.successMessage}
            </Type>
          </Flex>
        </Flex>
        {tool.executionArgs && <Badge>{tool.toolName}</Badge>}

        <Button
          variant="ghost"
          size="iconXS"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronDown
            size={16}
            strokeWidth={2}
            className={cn(
              "flex-shrink-0 transition-transform",
              isExpanded ? "rotate-180" : "",
            )}
          />
        </Button>
      </Flex>
      {isExpanded && (
        <Flex direction="col" gap="sm" className="w-full">
          <CodeBlock code={JSON.stringify(tool.executionArgs)} lang="json" />
        </Flex>
      )}
    </Flex>
  );
};
