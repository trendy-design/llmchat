import { providers } from "@/config/models";
import { models, stopReasons } from "@/lib/types";
import { z } from "zod";

export const assistantSchema = z.object({
  name: z.string(),
  systemPrompt: z.string(),
  iconURL: z.string().optional(),
  provider: z.enum(providers),
  baseModel: z.union([z.enum(models), z.string()]),
  key: z.string(),
  type: z.enum(["base", "custom"]),
});

export const promptSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
});

export const preferencesSchema = z.object({
  defaultAssistant: z.string(),
  systemPrompt: z.string(),
  messageLimit: z.number().int(),
  temperature: z.number(),
  memories: z.array(z.string()),
  defaultPlugins: z.array(z.string()),
  whisperSpeechToTextEnabled: z.boolean(),
  dalleImageQuality: z.enum(["standard", "hd"]),
  dalleImageSize: z.enum(["1024x1024", "1792x1024", "1024x1792"]),
  maxTokens: z.number().int(),
  defaultWebSearchEngine: z.enum(["google", "duckduckgo"]),
  ollamaBaseUrl: z.string(),
  topP: z.number(),
  topK: z.number(),
  googleSearchEngineId: z.string().optional(),
  googleSearchApiKey: z.string().optional(),
});

export const runConfigSchema = z.object({
  context: z.string().optional(),
  input: z.string().optional(),
  image: z.string().optional(),
  sessionId: z.string(),
  messageId: z.string().optional(),
  assistant: assistantSchema,
});

export const toolsSchema = z.array(
  z.object({
    toolName: z.string(),
    isLoading: z.boolean().default(false),
    executionArgs: z.any().optional(),
    executionResult: z.any().optional(),
    renderData: z.any().optional(),
  }),
);

export const chatMessageSchema = z.object({
  id: z.string(),
  image: z.string().optional(),
  rawHuman: z.string().optional(),
  rawAI: z.string().optional(),
  sessionId: z.string(),
  parentId: z.string(),
  runConfig: runConfigSchema,
  tools: toolsSchema.optional(),
  isLoading: z.boolean().optional(),
  stop: z.boolean().optional(),
  stopReason: z.enum(stopReasons).optional(),

  createdAt: z.string(),
});

export const apiKeysSchema = z.record(z.enum(providers), z.string());
export const chatSessionSchema = z.object({
  title: z.string().optional(),
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const dataValidator = z.object({
  preferences: preferencesSchema.optional(),
  apiKeys: apiKeysSchema.optional(),
  prompts: z.array(promptSchema).optional(),
  chatMessages: z
    .array(
      z.object({
        key: z.string().startsWith("messages-"),
        message: z.array(chatMessageSchema),
      }),
    )
    .optional(),
  chatSessions: z.array(chatSessionSchema).optional(),
  assistants: z.array(assistantSchema).optional(),
});
