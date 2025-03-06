import { Tool } from "ai";
import { AgentGraph } from "../main";

export enum ToolEnumType {
        SEARCH = 'search',

}

export type ToolCallBack = (graph: AgentGraph) => void;

export type ToolList = Record<ToolEnumType, (graph: AgentGraph) => Tool>;

