import { defaultPreferences } from "@/config";
import { TApiKeyInsert, TApiKeys, TPreferences, TProvider } from "@/lib/types";
import { getDB } from "@/libs/database/client";
import { schema } from "@/libs/database/schema";
import { eq, sql } from "drizzle-orm";

export class PreferenceService {
  async getApiKeys(): Promise<TApiKeys[]> {
    const db = await getDB();
    const result = await db.select().from(schema.apiKeys);
    return result;
  }

  async getPreferences(): Promise<TPreferences> {
    const db = await getDB();
    const result = await db?.select().from(schema.preferences).limit(1);
    return result?.[0] || defaultPreferences;
  }

  async setPreferences(
    preferences: Partial<Omit<TPreferences, "id">>,
  ): Promise<TPreferences> {
    const db = await getDB();
    const currentPreferences = await this.getPreferences();
    const newPreferences = { ...currentPreferences, ...preferences };
    await db
      ?.insert(schema.preferences)
      .values(newPreferences)
      .onConflictDoUpdate({
        target: schema.preferences.id,
        set: newPreferences,
      });
    return newPreferences;
  }

  async resetToDefaults(): Promise<void> {
    const db = await getDB();
    await db
      ?.insert(schema.preferences)
      .values(defaultPreferences)
      .onConflictDoUpdate({
        target: schema.preferences.id,
        set: defaultPreferences,
      });
  }

  async setApiKey(provider: TProvider, value: string): Promise<void> {
    try {
      const db = await getDB();
      const existingKey = await this.getApiKey(provider);
      if (!existingKey) {
        await db?.insert(schema.apiKeys).values({ provider, key: value });
      } else {
        await db
          ?.update(schema.apiKeys)
          .set({ key: value })
          .where(eq(schema.apiKeys.provider, provider));
      }
    } catch (error) {
      console.error("Error setting API key", error);
    }
  }

  async removeApiKey(provider: TProvider): Promise<void> {
    const db = await getDB();
    await db
      ?.delete(schema.apiKeys)
      .where(eq(schema.apiKeys.provider, provider));
  }

  async setApiKeys(records: TApiKeyInsert[]): Promise<void> {
    try {
      const db = await getDB();
      await db
        ?.insert(schema.apiKeys)
        .values(records)
        .onConflictDoUpdate({
          target: schema.apiKeys.provider,
          set: { key: sql`excluded.key` },
        });
    } catch (error) {
      console.error("Error setting API keys", error);
    }
  }

  async getApiKey(provider: TProvider): Promise<TApiKeys | undefined> {
    const db = await getDB();
    const result = await db
      ?.select()
      .from(schema.apiKeys)
      .where(eq(schema.apiKeys.provider, provider))
      .limit(1);
    return result?.[0];
  }
}

export const preferencesService = new PreferenceService();
