import { defaultPreferences } from "@/config";
import {
  TApiKeys,
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
    // Chat sessions and messages
    const sessions: TChatSession[] = (await get("chat-sessions")) || [];

    const sessionsTable = await db.select().from(schema.chatSessions);

    if (sessionsTable?.length > 0) {
      return;
    }

    for (const session of sessions) {
      if (session?.id && session?.title) {
        await db.insert(schema.chatSessions).values({
          id: session.id,
          title: session.title,
          createdAt: moment(session.createdAt).toDate(),
          updatedAt: moment(session.updatedAt).toDate(),
        });

        const messages: TChatMessage[] =
          (await get(`messages-${session.id}`)) || [];
        for (const message of messages) {
          if (message?.id && message?.sessionId) {
            await db.insert(schema.chatMessages).values({
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
            });
          }
        }
      }
    }

    // API keys
    const apiKeys: TApiKeys | undefined = await get("api-keys");
    if (apiKeys) {
      for (const [provider, key] of Object.entries(apiKeys)) {
        if (provider && key) {
          await db.insert(schema.apiKeys).values({ provider, key });
        }
      }
    }

    // Assistants
    const assistants: TAssistant[] = (await get("assistant")) || [];
    for (const assistant of assistants) {
      if (assistant?.name && assistant?.key) {
        await db.insert(schema.assistants).values({
          name: assistant.name,
          key: assistant.key,
          type: assistant.type,
          provider: assistant.provider as TProvider,
          systemPrompt: assistant.systemPrompt,
          baseModel: assistant.baseModel,
          iconURL: assistant.iconURL,
        });
      }
    }

    // Preferences
    const storedPreferences = (await get("preferences")) || {};
    const preferences: TPreferences = {
      ...defaultPreferences,
      ...storedPreferences,
    };
    await db.insert(schema.preferences).values({
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
  } catch (error) {
    console.error("Migration v1 failed:", error);
  }
};
