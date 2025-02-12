import { useChatContext, usePreferenceContext } from "@/lib/context";
import {
  dalleToolDefinition,
  duckduckGoToolDefinition,
  googleSearchToolDefinition,
  memoryToolDefinition,
  readerToolDefinition,
} from "@/lib/tools";
import { TModelItem, ToolDefinition, ToolKey } from "@repo/shared/types";
import { barChartToolDefinition } from "../tools/bar-chart";
import { lineChartToolDefinition } from "../tools/line-chart";
import { pieChartToolDefinition } from "../tools/pie-chart";

export const useTools = () => {
  const { store } = useChatContext();
  const { preferences, updatePreferences, apiKeys } = usePreferenceContext();
  const addTool = store((state) => state.addTool);

  const tools: ToolDefinition[] = [
    preferences.defaultWebSearchEngine === "duckduckgo"
      ? duckduckGoToolDefinition
      : googleSearchToolDefinition,
    dalleToolDefinition,
    memoryToolDefinition,
    readerToolDefinition,
    barChartToolDefinition,
    pieChartToolDefinition,
    lineChartToolDefinition,
  ];

  const getToolByKey = (key: ToolKey) => {
    return tools.find((tool) => tool.key.includes(key));
  };

  const getAvailableTools = (model: TModelItem) => {
    const plugins = preferences.defaultPlugins || [];

    return (
      model?.plugins
        ?.filter((p) => plugins.includes(p))
        ?.map((p) =>
          getToolByKey(p)?.executionFunction({
            updatePreferences,
            preferences,
            model,
            apiKeys,
            updateToolExecutionState: addTool,
          }),
        )
        ?.filter((t): t is any => !!t) || []
    );
  };

  return {
    tools,
    getToolByKey,
    getAvailableTools,
  };
};
