import { ToolEnumType, ToolList } from "./types";
import { webbrowsingTool } from "./web-search";
export * from "./types";
export * from "./web-search";

export const toolsDirectory: ToolList = {
        [ToolEnumType.SEARCH]: (graph) => webbrowsingTool(graph),

};

