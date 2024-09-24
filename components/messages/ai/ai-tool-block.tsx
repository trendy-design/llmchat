import { ToolDefinition, ToolExecutionState } from "@/types";
import { Flex, Spinner, Type } from "@/ui";

export type AiToolBlockProps = {
  tool: ToolExecutionState;
  definition: ToolDefinition;
};

export const AiToolBlock = ({ tool, definition }: AiToolBlockProps) => {
  const Icon = definition.compactIcon;
  return (
    <Flex className="w-full pr-2" direction="col" gap="sm">
      <Flex gap="sm" className="w-full" items="center">
        <Flex gap="sm" items="center" className="w-full">
          <Flex
            items="center"
            justify="center"
            className="h-6 w-6 rounded-md border border-zinc-500/15 bg-white shadow-sm dark:bg-zinc-700"
          >
            {tool.isLoading ? (
              <Spinner />
            ) : (
              <Icon
                size={14}
                strokeWidth={2}
                className="mt-0.5 flex-shrink-0"
              />
            )}
          </Flex>
          <Flex direction="col" gap="xs" className="w-full flex-1">
            <Type size="sm" weight="medium">
              {tool.isLoading
                ? definition.loadingMessage
                : definition.successMessage}
            </Type>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
