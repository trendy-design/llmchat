import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { schema } from "../database/schema";

export const assistantSchema = createSelectSchema(schema.assistants);

export const promptSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
});

export const preferencesSchema = createSelectSchema(schema.preferences, {
  defaultPlugins: z.array(z.string()),
  memories: z.array(z.string()),
});

export const runConfigSchema = z.object({
  context: z.string().optional(),
  input: z.string().optional(),
  image: z.string().optional(),
  sessionId: z.string(),
  messageId: z.string().optional(),
  assistant: assistantSchema,
});

export type RunConfigProps = z.infer<typeof runConfigSchema>;

export const toolsSchema = z.array(
  z.object({
    toolName: z.string(),
    isLoading: z.boolean().default(false),
    executionArgs: z.any().optional(),
    executionResult: z.any().optional(),
    renderData: z.any().optional(),
  }),
);

export const chatMessageSchema = createSelectSchema(schema.chatMessages, {
  runConfig: runConfigSchema,
  tools: toolsSchema,
  relatedQuestions: z.array(z.string()).nullable(),
});

export const apiKeysSchema = createSelectSchema(schema.apiKeys);

export type ApiKeysProps = z.infer<typeof apiKeysSchema>;

export const chatSessionSchema = createSelectSchema(schema.chatSessions);

export const dataValidator = z.object({
  preferences: preferencesSchema.optional(),
  apiKeys: z.array(apiKeysSchema).optional(),
  prompts: z.array(promptSchema).optional(),
  chatMessages: z.array(chatMessageSchema).optional(),
  chatSessions: z.array(chatSessionSchema).optional(),
  assistants: z.array(assistantSchema).optional(),
});
