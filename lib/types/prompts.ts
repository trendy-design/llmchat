import { TFileAttachment } from "./messages";

export type TConstructPrompt = {
  context?: string;
  image?: string;
  attachment?: TFileAttachment;
  memories: string[];
  hasMessages: boolean;
  systemPrompt: string;
  formatInstructions?: boolean;
};
