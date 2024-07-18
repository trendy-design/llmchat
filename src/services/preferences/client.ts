import { configs } from "@/config";
import { TApiKeys, TPreferences } from "@/types";
import { get, set } from "idb-keyval";

class PreferenceService {
  async getApiKeys(): Promise<TApiKeys> {
    return (await get("api-keys")) || {};
  }

  async getPreferences(): Promise<TPreferences> {
    return (await get("preferences")) as TPreferences;
  }

  async setPreferences(
    preferences: Partial<TPreferences>
  ): Promise<TPreferences> {
    const currentPreferences = await this.getPreferences();
    const newPreferences = { ...currentPreferences, ...preferences };
    await set("preferences", newPreferences);
    return newPreferences;
  }

  async resetToDefaults(): Promise<void> {
    await set("preferences", configs.defaultPreferences);
  }

  async setApiKey(key: string, value: string): Promise<void> {
    const keys = await this.getApiKeys();
    const newKeys = { ...keys, [key]: value };
    await set("api-keys", newKeys);
  }

  async getApiKey(key: string): Promise<string | undefined> {
    const keys = await this.getApiKeys();
    return keys[key as keyof TApiKeys];
  }
}

export const preferencesService = new PreferenceService();
