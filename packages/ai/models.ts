import { ProviderEnumType } from './providers';

export enum ModelEnum {
  GPT_4o_Mini = 'gpt-4o-mini',
  GPT_4o = 'gpt-4o',
  Deepseek_R1_Distill_Qwen_14B = 'deepseek-r1-distill-qwen-14b',
  Claude_3_5_Sonnet = 'claude-3-5-sonnet-20240620',
  O3_Mini = 'o3-mini',
  GEMINI_2_FLASH = 'gemini-2.0-flash',
  QWQ_32B = 'accounts/fireworks/models/qwq-32b',
  Deepseek_R1 = 'accounts/fireworks/models/deepseek-r1',
  Claude_3_7_Sonnet = 'claude-3-7-sonnet-20250219',
}

export type Model = {
  id: ModelEnum;
  name: string;
  provider: ProviderEnumType;
  maxTokens: number;
  contextWindow: number;
};

export const models: Model[] = [
  {
    id: ModelEnum.GPT_4o_Mini,
    name: 'GPT-4o Mini',
    provider: 'openai',
    maxTokens: 16384,
    contextWindow: 16384,
  },
  {
    id: ModelEnum.GPT_4o,
    name: 'GPT-4o',
    provider: 'openai',
    maxTokens: 16384,
    contextWindow: 16384,
  },
  {
    id: ModelEnum.O3_Mini,
    name: 'O3 Mini',
    provider: 'openai',
    maxTokens: 16384,
    contextWindow: 16384,
  },
  {
    id: ModelEnum.GPT_4o_Mini,
    name: 'GPT-4o Mini',
    provider: 'openai',
    maxTokens: 16384,
    contextWindow: 16384,
  },
  {
    id: ModelEnum.Deepseek_R1_Distill_Qwen_14B,
    name: 'DeepSeek R1 Distill Qwen 14B',
    provider: 'together',
    maxTokens: 16384,
    contextWindow: 16384,
  },
  {
    id: ModelEnum.Deepseek_R1,
    name: 'DeepSeek R1',
    provider: 'fireworks',
    maxTokens: 16384,
    contextWindow: 16384,
  },
  {
    id: ModelEnum.Claude_3_5_Sonnet,
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    maxTokens: 16384,
    contextWindow: 16384,
  },
  {
    id: ModelEnum.Claude_3_7_Sonnet,
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    maxTokens: 16384,
    contextWindow: 16384,
  },
  {
    id: ModelEnum.GEMINI_2_FLASH,
    name: 'Gemini 2 Flash',
    provider: 'google',
    maxTokens: 200000,
    contextWindow: 200000,
  },
  {
    id: ModelEnum.QWQ_32B,
    name: 'QWQ 32B',
    provider: 'fireworks',
    maxTokens: 16384,
    contextWindow: 16384,
  },
];
