import { providers } from "@/config/models";
import {
  boolean,
  decimal,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { TLLMRunConfig, stopReasons } from "../types/messages";
import { ToolExecutionState, ToolKey } from "../types/tools";

export const assistantTypeEnum = pgEnum("assistant_type", ["base", "custom"]);
export const dalleImageQualityEnum = pgEnum("dalle_image_quality", [
  "standard",
  "hd",
]);
export const dalleImageSizeEnum = pgEnum("dalle_image_size", [
  "1024x1024",
  "1792x1024",
  "1024x1792",
]);
export const webSearchEngineEnum = pgEnum("web_search_engine", [
  "google",
  "duckduckgo",
]);
export const stopReasonEnum = pgEnum("stop_reason", stopReasons);

export const providerEnum = pgEnum("provider", providers);

export const prompts = pgTable("prompts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: text("id").primaryKey(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .$type<string>()
    .references(() => chatSessions.id),
  parentId: text("parent_id").$type<string>(),
  image: text("image"),
  rawHuman: text("raw_human"),
  rawAI: text("raw_ai"),
  isLoading: boolean("is_loading").default(false),
  stop: boolean("stop").default(false),
  stopReason: stopReasonEnum("stop_reason"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  runConfig: json("run_config").$type<TLLMRunConfig>().notNull(),
  tools: json("tools").$type<ToolExecutionState[]>(),
  relatedQuestions: json("related_questions").$type<string[]>(),
});

export const assistants = pgTable("assistants", {
  name: text("name").notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt").notNull(),
  iconURL: text("icon_url"),
  provider: providerEnum("provider").notNull(),
  baseModel: text("base_model").notNull(),
  key: text("key").unique().primaryKey(),
  type: assistantTypeEnum("type").notNull(),
});

export const preferences = pgTable("preferences", {
  id: integer("id").primaryKey().default(1),
  defaultAssistant: text("default_assistant").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  messageLimit: integer("message_limit").notNull(),
  temperature: decimal("temperature").notNull(),
  memories: json("memories").$type<string[]>().notNull(),
  suggestRelatedQuestions: boolean("suggest_related_questions").notNull(),
  generateTitle: boolean("generate_title").notNull(),
  defaultPlugins: json("default_plugins").$type<ToolKey[]>().notNull(),
  whisperSpeechToTextEnabled: boolean(
    "whisper_speech_to_text_enabled",
  ).notNull(),
  dalleImageQuality: dalleImageQualityEnum("dalle_image_quality").notNull(),
  dalleImageSize: dalleImageSizeEnum("dalle_image_size").notNull(),
  maxTokens: integer("max_tokens").notNull(),
  defaultWebSearchEngine: webSearchEngineEnum(
    "default_web_search_engine",
  ).notNull(),
  ollamaBaseUrl: text("ollama_base_url").notNull(),
  topP: decimal("top_p").notNull(),
  topK: decimal("top_k").notNull(),
  googleSearchEngineId: text("google_search_engine_id"),
  googleSearchApiKey: text("google_search_api_key"),
});

export const apiKeys = pgTable("api_keys", {
  provider: text("provider").primaryKey(),
  key: text("key").notNull(),
});

export const schema = {
  apiKeys,
  assistants,
  chatMessages,
  chatSessions,
  preferences,
  prompts,
  assistantTypeEnum,
  dalleImageQualityEnum,
  dalleImageSizeEnum,
  webSearchEngineEnum,
  stopReasonEnum,
};
