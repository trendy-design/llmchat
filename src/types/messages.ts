import { TAssistant } from "./assistants";
import { TToolResponse } from "./tools";

export type TStopReason =
  | "error"
  | "cancel"
  | "apikey"
  | "recursion"
  | "finish"
  | "rateLimit"
  | "unauthorized";

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
  tools?: TToolResponse[];
  isLoading?: boolean;
  stop?: boolean;
  stopReason?: TStopReason;
  createdAt: string;
  relatedQuestions?: string[];
};
