import { Spinner, Type } from "@/components/ui";
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
        <Type
          size="xs"
          className="flex flex-row items-center gap-2 pb-4"
          textColor="tertiary"
        >
          {tool?.toolLoading ? (
            <Spinner />
          ) : (
            <Icon size={20} strokeWidth={1.5} />
          )}
          <Type size="sm" textColor="tertiary">
            {tool?.toolLoading
              ? toolUsed.loadingMessage
              : toolUsed.resultMessage}
          </Type>
        </Type>
      )}

      {toolUsed &&
        tool?.toolRenderArgs &&
        toolUsed?.renderUI?.(tool?.toolRenderArgs)}
    </>
  );
};
