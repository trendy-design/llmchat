import { defaultPreferences } from "@/config";
import {
  TAssistant,
  TChatMessage,
  TChatSession,
  TPreferences,
  TProvider,
} from "@/types";
import { drizzle } from "drizzle-orm/pglite";
import { get } from "idb-keyval";
import moment from "moment";
import { schema } from "../schema";

export const runMigrationv1 = async (db: ReturnType<typeof drizzle>) => {
  try {
    await db.transaction(async (tx) => {
      const [sessions, apiKeys, assistants, storedPreferences] =
        await Promise.all([
          get("chat-sessions"),
          get("api-keys"),
          get("assistant"),
          get("preferences"),
        ]);

      const sessionsTable = await tx.select().from(schema.chatSessions);
      if (sessionsTable?.length > 0) return;

      // Migrate chat sessions and messages
      if (sessions) {
        await tx.insert(schema.chatSessions).values(
          sessions.map((session: TChatSession) => ({
            id: session.id,
            title: session.title,
            createdAt: moment(session.createdAt).toDate(),
            updatedAt: moment(session.updatedAt).toDate(),
          })),
        );

        const allMessages = await Promise.all(
          sessions.map((session: TChatSession) =>
            get(`messages-${session.id}`),
          ),
        );

        const flattenedMessages = allMessages.flat().filter(Boolean);
        await tx.insert(schema.chatMessages).values(
          flattenedMessages.map((message: TChatMessage) => ({
            id: message.id,
            sessionId: message.sessionId,
            runConfig: message.runConfig,
            errorMessage: message.errorMessage,
            image: message?.image,
            parentId: message?.parentId,
            isLoading: message?.isLoading || false,
            rawAI: message?.rawAI,
            rawHuman: message?.rawHuman,
            relatedQuestions: message?.relatedQuestions,
            stop: message?.stop,
            stopReason: message?.stopReason,
            tools: message?.tools,
            createdAt: moment(message.createdAt).toDate(),
          })),
        );
      }

      // Migrate API keys
      if (apiKeys) {
        await tx.insert(schema.apiKeys).values(
          Object.entries(apiKeys).map(([provider, key]: [any, any]) => ({
            provider,
            key,
          })),
        );
      }

      // Migrate assistants
      if (assistants) {
        await tx.insert(schema.assistants).values(
          assistants.map((assistant: TAssistant) => ({
            name: assistant.name,
            key: assistant.key,
            type: assistant.type,
            provider: assistant.provider as TProvider,
            systemPrompt: assistant.systemPrompt,
            baseModel: assistant.baseModel,
            iconURL: assistant.iconURL,
          })),
        );
      }

      // Migrate preferences
      const preferences: TPreferences = {
        ...defaultPreferences,
        ...storedPreferences,
      };
      await tx.insert(schema.preferences).values({
        id: 1,
        defaultAssistant: preferences.defaultAssistant,
        systemPrompt: preferences.systemPrompt,
        messageLimit: preferences.messageLimit,
        temperature: preferences.temperature,
        suggestRelatedQuestions: preferences.suggestRelatedQuestions,
        generateTitle: preferences.generateTitle,
        memories: preferences.memories,
        dalleImageQuality: preferences.dalleImageQuality,
        dalleImageSize: preferences.dalleImageSize,
        ollamaBaseUrl: preferences.ollamaBaseUrl,
        whisperSpeechToTextEnabled: preferences.whisperSpeechToTextEnabled,
        defaultWebSearchEngine: preferences.defaultWebSearchEngine,
        defaultPlugins: preferences.defaultPlugins,
        maxTokens: +preferences.maxTokens,
        topP: preferences.topP,
        topK: preferences.topK,
      });
    });
  } catch (error) {
    console.error("Migration v1 failed:", error);
  }
};
