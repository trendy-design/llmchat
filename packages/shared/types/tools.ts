import { DynamicStructuredTool } from "@langchain/core/tools";
import { ReactNode } from "react";
import { LucideIcon } from "./icons";
import { TModelItem } from "./models";
import { TApiKeys, TPreferences } from "./preferences";

export const toolKeys = ["calculator", "web_search"];

export type ToolExecutionFunction = (
  args: ToolExecutionContext,
) => DynamicStructuredTool;

export type ToolExecutionContext = {
  apiKeys: TApiKeys[];
  updateToolExecutionState: (state: ToolExecutionState) => void;
  preferences: TPreferences;
  updatePreferences?: (preferences: Partial<TPreferences>) => void;
  model: TModelItem;
};

export type ToolExecutionState = {
  toolName: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  executionArgs?: Record<string, any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  renderData?: Record<string, any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  executionResult?: any;
  isLoading: boolean;
};

export type ToolValidationContext = {
  apiKeys: TApiKeys[];
  preferences: TPreferences;
};

export type ToolDefinition = {
  key: ToolKey;
  description: string;
  displayName: string;
  executionFunction: ToolExecutionFunction;
  loadingMessage?: string;
  successMessage?: string;
  isBeta?: boolean;
  isEnforced?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  renderComponent?: (args: any) => ReactNode;
  isVisibleInMenu?: boolean;
  validateAvailability?: (context: ToolValidationContext) => Promise<boolean>;
  onValidationFailed?: () => void;
  icon: LucideIcon;
  compactIcon: LucideIcon;
};

export type ToolKey = (typeof toolKeys)[number];
export type IconSize = "sm" | "md" | "lg";
