import { ProviderEnumType } from 'llm/providers';

export enum ModelEnum {
  GPT_4o_Mini = 'gpt-4o-mini',
  Deepseek_R1_Distill_Qwen_14B = 'deepseek-r1-distill-qwen-14b',
  Claude_3_Opus_20240229 = 'claude-3-opus-20240229',
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
    id: ModelEnum.Deepseek_R1_Distill_Qwen_14B,
    name: 'DeepSeek R1 Distill Qwen 14B',
    provider: 'together',
    maxTokens: 16384,
    contextWindow: 16384,
  },
  {
    id: ModelEnum.Claude_3_Opus_20240229,
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    maxTokens: 16384,
    contextWindow: 16384,
  },
];
