import { usePreferenceContext } from "@/context";
import { HugeiconsProps } from "@hugeicons/react";
import { FC, ReactNode, RefAttributes } from "react";
import { TModelItem } from "./models";
import { TApiKeys, TPreferences } from "./preferences";

export const toolKeys = ["calculator", "web_search"];

export type TToolResponse = {
  toolName: string;
  toolLoading?: boolean;
  toolArgs?: any;
  toolResponse?: any;
  toolRenderArgs?: any;
};

export type TToolConfig = {
  key: TToolKey;
  description: string;
  name: string;
  loadingMessage?: string;
  resultMessage?: string;
  isBeta?: boolean;
  renderUI?: (args: any) => ReactNode;
  showInMenu?: boolean;
  validate?: () => Promise<boolean>;
  validationFailedAction?: () => void;
  tool: (args: TToolArg) => any;
  icon: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>;
  smallIcon: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>;
};

export type TToolArg = {
  updatePreferences: ReturnType<
    typeof usePreferenceContext
  >["updatePreferences"];
  preferences: TPreferences;
  apiKeys: TApiKeys;
  model: TModelItem;
  sendToolResponse: (response: TToolResponse) => void;
};

export type TToolKey = (typeof toolKeys)[number];
export type IconSize = "sm" | "md" | "lg";
