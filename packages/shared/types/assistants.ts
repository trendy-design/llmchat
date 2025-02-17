import { TModelItem, TProvider } from './models';

export type TAssistantType = 'base' | 'custom';

export type TAssistant = {
  key: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  iconURL: string | null;
  provider: TProvider;
  baseModel: string;
  type: 'custom' | 'base';
};

export type TCustomAssistant = {
  key: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  iconURL: string | null;
  startMessage: string[] | null;
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
