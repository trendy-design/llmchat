import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModelV1 } from '@ai-sdk/provider';
import { createTogetherAI } from '@ai-sdk/togetherai';
import { ModelEnum, models } from './models';


export const Providers = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  TOGETHER: 'together',
  GOOGLE: 'google',
} as const;



export type ProviderEnumType = (typeof Providers)[keyof typeof Providers];

export const getProviderInstance = (provider: ProviderEnumType) => {
  switch (provider) {
    case Providers.OPENAI:
      return createOpenAI({
        apiKey: process.env.OPENAI_API_KEY || '',
      });
    case 'anthropic':
      return createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || '',
      });
    case 'together':
      return createTogetherAI({
        apiKey: process.env.TOGETHER_API_KEY || '',
      });
    case 'google':
      return createGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY || '',
      });
    default:
      return createOpenAI({
        apiKey: process.env.OPENAI_API_KEY || '',
      });
  }
};

export const getLanguageModel = (m: ModelEnum) => {
  const model = models.find(model => model.id === m);
  const instance = getProviderInstance(model?.provider as ProviderEnumType);
  return instance(model?.id || 'gpt-4o-mini') as LanguageModelV1;
};
