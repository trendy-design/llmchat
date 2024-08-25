import { Flex, Type } from "@/components/ui";
import { useTools } from "@/lib/hooks";
import { ToolExecutionState } from "@/lib/types";
import { mono } from "../../../app/fonts";

type AIToolMessageProps = {
  tool: ToolExecutionState;
};

export const AIToolMessage = ({ tool }: AIToolMessageProps) => {
  const { getToolByKey } = useTools();

  const toolUsed = tool.toolName ? getToolByKey(tool.toolName) : undefined;

  if (!toolUsed) {
    return null;
  }

  const Icon = toolUsed.compactIcon;

  return (
    <Flex direction="col" items="start" gap="sm" className="mb-4 w-full">
      <Flex
        className="w-full rounded-lg bg-zinc-50 p-2.5 pr-3 dark:bg-zinc-700/50"
        gap="sm"
      >
        <Icon size={16} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
        <Flex direction="col" gap="xs">
          <Type size="sm" weight="medium">
            {tool.isLoading ? toolUsed.loadingMessage : toolUsed.successMessage}
          </Type>
          {tool.executionArgs && (
            <Type
              className="line-clamp-1"
              style={mono.style}
              size="xs"
              textColor="secondary"
            >
              {JSON.stringify(tool.executionArgs) || "No arguments"}
            </Type>
          )}
        </Flex>
      </Flex>

      {tool.renderData && toolUsed.renderComponent?.(tool.renderData)}
    </Flex>
  );
};
