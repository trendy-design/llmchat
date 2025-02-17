import { schema } from '../db/schema';
import { TAssistant } from './assistants';
import { TProvider } from './models';
import { ToolKey } from './tools';

export type TApiKeys = typeof schema.apiKeys.$inferSelect;
export type TApiKeyInsert = typeof schema.apiKeys.$inferInsert;

export type TLegacyApiKeys = Partial<Record<TProvider, string>>;

export type TPreferencesState = {
  preferences: TPreferences;
  setPreferences: (preferences: Partial<TPreferences>) => void;
  apiKeys: TApiKeys[];
  setApiKeys: (apiKeys: TApiKeys[]) => void;
};

export type TPreferences = typeof schema.preferences.$inferSelect;

export type TLegacyPreferences = {
  defaultAssistant: TAssistant['key'];
  systemPrompt: string;
  messageLimit: number;
  temperature: number;
  memories: string[];
  suggestRelatedQuestions: boolean;
  generateTitle: boolean;
  defaultPlugins: ToolKey[];
  whisperSpeechToTextEnabled: boolean;
  dalleImageQuality: 'standard' | 'hd';
  dalleImageSize: '1024x1024' | '1792x1024' | '1024x1792';
  maxTokens: number;
  defaultWebSearchEngine: 'google' | 'duckduckgo';
  ollamaBaseUrl: string;
  topP: number;
  topK: number;
  googleSearchEngineId?: string;
  googleSearchApiKey?: string;
};
