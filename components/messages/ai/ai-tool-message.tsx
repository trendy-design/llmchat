import { Flex } from "@/components/ui";
import { useTools } from "@/lib/hooks";
import { ToolExecutionState } from "@/lib/types";
import { AiToolBlock } from "./ai-tool-block";

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
    <Flex direction="col" items="start" gap="lg" className="w-full">
      <AiToolBlock tool={tool} definition={toolUsed} />

      {tool.renderData && toolUsed.renderComponent?.(tool.renderData)}
    </Flex>
  );
};
