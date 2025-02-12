import { db } from '@/lib/db';
import { defaultPreferences } from "@repo/shared/config";
import { TApiKeys, TPreferences, TProvider } from "@repo/shared/types";

export class PreferenceService {
  async getApiKeys(): Promise<TApiKeys[]> {
    return await db.apiKeys.toArray();
  }

  async getPreferences(): Promise<TPreferences> {
    const prefs = await db.preferences.toArray();
    return prefs[0] || defaultPreferences;
  }

  async setPreferences(
    preferences: Partial<Omit<TPreferences, "id">>,
  ): Promise<TPreferences> {
    const currentPreferences = await this.getPreferences();
    const newPreferences = { ...currentPreferences, ...preferences };
    
    if (currentPreferences.id) {
      await db.preferences.update(currentPreferences.id, newPreferences);
    } else {
      await db.preferences.add(newPreferences);
    }
    
    return newPreferences;
  }

  async resetToDefaults(): Promise<void> {
    await db.preferences.clear();
    await db.preferences.add(defaultPreferences);
  }

  async setApiKey(provider: TProvider, value: string): Promise<void> {
    await db.apiKeys.put({ provider, key: value });
  }

  async removeApiKey(provider: TProvider): Promise<void> {
    await db.apiKeys.delete(provider);
  }

  async setApiKeys(records: TApiKeys[]): Promise<void> {
    await db.apiKeys.bulkPut(records);
  }

  async getApiKey(provider: TProvider): Promise<TApiKeys | undefined> {
    return await db.apiKeys.get(provider);
  }
}

export const preferencesService = new PreferenceService();
