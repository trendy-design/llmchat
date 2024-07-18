import { TPreferences } from "./types";

export const defaultPreferences: TPreferences = {
  defaultAssistant: "gpt-3.5-turbo",
  systemPrompt: "You're helpful assistant that can help me with my questions.",
  messageLimit: 30,
  temperature: 0.5,
  memories: [],
  ollamaBaseUrl: "http://localhost:11434",
  whisperSpeechToTextEnabled: false,
  defaultWebSearchEngine: "duckduckgo",
  defaultPlugins: [],
  maxTokens: 1000,
  topP: 1.0,
  topK: 5,
};

export const configs = {
  defaultPreferences,
  googleSearchApi: "https://www.googleapis.com/customsearch/v1",
  openaiApiKeyUrl: "https://platform.openai.com/api-keys",
  geminiApiKeyUrl: "https://console.gemini.google.com/api-keys",
  anthropicApiKeyUrl: "https://console.anthropic.com/settings/keys",
  googleSearchApiUrl:
    "https://programmablesearchengine.google.com/controlpanel/create",
};
