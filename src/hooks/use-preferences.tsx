import { get, set } from "idb-keyval";
import { TBaseModel, TModelKey } from "./use-model-list";

export type TApiKeys = Partial<Record<TBaseModel, string>>;
export type TPreferences = {
  defaultModel: TModelKey;
  systemPrompt: string;
  messageLimit: number | "all";
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
};

export const defaultPreferences: TPreferences = {
  defaultModel: "gpt-4-turbo",
  systemPrompt: "You are a helpful assistant.",
  messageLimit: "all",
  temperature: 0.5,
  maxTokens: 500,
  topP: 1.0,
  topK: 5,
};

export const usePreferences = () => {
  const getApiKeys = async (): Promise<TApiKeys> => {
    return (await get("api-keys")) || {};
  };

  const getPreferences = async (): Promise<TPreferences> => {
    return (await get("preferences")) || defaultPreferences;
  };

  const setPreferences = async (preferences: Partial<TPreferences>) => {
    const currentPreferences = await getPreferences();
    const newPreferences = { ...currentPreferences, ...preferences };
    await set("preferences", newPreferences);
  };

  const resetToDefaults = async () => {
    await set("preferences", defaultPreferences);
  };

  const setApiKey = async (key: TBaseModel, value: string) => {
    const keys = await getApiKeys();
    const newKeys = { ...keys, [key]: value };
    await set("api-keys", newKeys);
  };

  const getApiKey = async (key: TBaseModel) => {
    const keys = await getApiKeys();
    return keys[key];
  };

  return {
    getApiKeys,
    setApiKey,
    getApiKey,
    getPreferences,
    setPreferences,
    resetToDefaults,
  };
};
