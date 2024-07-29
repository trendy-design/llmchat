import { Flex, Spinner, Type } from "@/components/ui";
import { useTools } from "@/hooks";
import { TToolResponse } from "@/types";

type TAIToolMessage = {
  tool: TToolResponse;
};

export const AIToolMessage = ({ tool }: TAIToolMessage) => {
  const { getToolInfoByKey } = useTools();

  const toolUsed = tool?.toolName
    ? getToolInfoByKey(tool?.toolName)
    : undefined;

  if (!toolUsed) {
    return null;
  }

  const Icon = toolUsed.smallIcon;

  return (
    <>
      {toolUsed && (
        <Flex
          direction="row"
          items="center"
          gap="sm"
          className="mb-4 rounded-full bg-zinc-500/10 px-3 py-1.5"
        >
          {tool?.toolLoading ? <Spinner /> : <Icon size={16} strokeWidth={2} />}
          <Type size="sm" textColor="secondary">
            {tool?.toolLoading
              ? toolUsed.loadingMessage
              : toolUsed.resultMessage}
          </Type>
        </Flex>
      )}

      {toolUsed &&
        tool?.toolRenderArgs &&
        toolUsed?.renderUI?.(tool?.toolRenderArgs)}
    </>
  );
};
