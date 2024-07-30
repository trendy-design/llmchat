import { TModelItem, TModelKey, TProvider } from "./models";

export type TAssistantType = "base" | "custom";

export type TAssistant = {
  name: string;
  systemPrompt: string;
  iconURL?: string;
  provider: TProvider;
  baseModel: TModelKey;
  key: TModelKey | string;
  type: TAssistantType;
};

export type TAssistantsProvider = {
  children: React.ReactNode;
};

export type TAssistantMenuItem = {
  name: string;
  key: string;
  icon: () => React.ReactNode;
  component: React.ReactNode;
};

export type TAssistantsContext = {
  open: () => void;
  dismiss: () => void;
  assistants: TAssistant[];
  selectedAssistant?: {
    assistant: TAssistant;
    model: TModelItem;
  };
};
