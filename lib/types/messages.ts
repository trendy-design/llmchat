import { TAssistant } from "./assistants";
import { ToolExecutionState } from "./tools";

export const stopReasons = [
  "error",
  "cancel",
  "apikey",
  "recursion",
  "finish",
] as const;

export type TStopReason = (typeof stopReasons)[number];

export type TLLMRunConfig = {
  context?: string;
  input?: string;
  image?: string;
  sessionId: string;
  messageId?: string;
  assistant: TAssistant;
};

export type TChatMessage = {
  id: string;
  image?: string;
  rawHuman?: string;
  rawAI?: string;
  sessionId: string;
  parentId: string;
  runConfig: TLLMRunConfig;
  tools?: ToolExecutionState[];
  isLoading?: boolean;
  stop?: boolean;
  stopReason?: TStopReason;
  errorMessage?: string;
  createdAt: string;
  relatedQuestions?: string[];
};
