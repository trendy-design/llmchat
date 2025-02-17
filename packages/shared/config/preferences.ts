import { TPreferences } from '@repo/shared/types';

export const defaultPreferences: TPreferences = {
  id: 1,
  defaultAssistant: process.env.NEXT_PUBLIC_ENABLE_AUTH === 'true' ? 'llmchat' : 'gpt-4o-mini',
  systemPrompt:
    "You're helpful assistant that can help me with my questions. Today is {{local_date}}.",
  messageLimit: 5,
  temperature: '0.5',
  suggestRelatedQuestions: true,
  generateTitle: true,
  memories: [],
  dalleImageQuality: 'standard',
  dalleImageSize: '1024x1024',
  ollamaBaseUrl: 'http://localhost:11434',
  whisperSpeechToTextEnabled: false,
  googleSearchEngineId: null,
  googleSearchApiKey: null,
  defaultWebSearchEngine: 'duckduckgo',
  defaultPlugins: [],
  maxTokens: 2000,
  topP: '1.0',
  topK: '5',
};

export const defaultKeys = {
  ollama: 'ollama',
  llmchat: 'llmchat',
};
