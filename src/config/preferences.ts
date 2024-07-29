import { TPreferences } from "@/types";

export const defaultPreferences: TPreferences = {
  defaultAssistant: "llmchat",
  systemPrompt:
    "You're helpful assistant that can help me with my questions. Today is {{local_date}}.",
  messageLimit: 30,
  temperature: 0.5,
  suggestRelatedQuestions: true,
  generateTitle: true,
  memories: [],
  dalleImageQuality: "standard",
  dalleImageSize: "1024x1024",
  ollamaBaseUrl: "http://localhost:11434",
  whisperSpeechToTextEnabled: false,
  defaultWebSearchEngine: "duckduckgo",
  defaultPlugins: [],
  maxTokens: 1000,
  topP: 1.0,
  topK: 5,
};
