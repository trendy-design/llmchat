import { useMutation, useQuery } from "@tanstack/react-query";
import { get, set } from "idb-keyval";
import { TBaseModel, TModelKey } from "./use-model-list";
import { TToolKey } from "./use-tools";

export type TApiKeys = Partial<Record<TBaseModel, string>>;
export type TPreferences = {
  defaultModel: TModelKey;
  systemPrompt: string;
  messageLimit: number;
  temperature: number;
  defaultPlugins: TToolKey[];
  whisperSpeechToTextEnabled: boolean;
  maxTokens: number;
  defaultWebSearchEngine: "google" | "duckduckgo";
  topP: number;
  topK: number;
  googleSearchEngineId?: string;
  googleSearchApiKey?: string;
};

export const defaultPreferences: TPreferences = {
  defaultModel: "gpt-3.5-turbo",
  systemPrompt: "You are a helpful assistant.",
  messageLimit: 30,
  temperature: 0.5,
  whisperSpeechToTextEnabled: false,
  defaultWebSearchEngine: "duckduckgo",
  defaultPlugins: [],
  maxTokens: 1000,
  topP: 1.0,
  topK: 5,
};

export const usePreferences = () => {
  const preferencesQuery = useQuery({
    queryKey: ["preferences"],
    queryFn: () => getPreferences(),
  });

  const apiKeysQuery = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => getApiKeys(),
  });

  const setPreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<TPreferences>) =>
      await setPreferences(preferences),

    onSuccess() {
      console.log("refetching");
      preferencesQuery.refetch();
    },
  });

  const setApiKeyMutation = useMutation({
    mutationFn: async ({ key, value }: any) => setApiKey(key, value),
    onSuccess: () => {
      apiKeysQuery.refetch();
    },
  });

  const resetToDefaultsMutation = useMutation({
    mutationFn: () => resetToDefaults(),
    onSuccess: () => {
      preferencesQuery.refetch();
    },
  });

  const getApiKeys = async (): Promise<TApiKeys> => {
    return (await get("api-keys")) || {};
  };

  const getPreferences = async (): Promise<TPreferences> => {
    return (await get("preferences")) as TPreferences;
  };

  const setPreferences = async (preferences: Partial<TPreferences>) => {
    const currentPreferences = await getPreferences();
    const newPreferences = { ...currentPreferences, ...preferences };
    await set("preferences", newPreferences);
    return newPreferences;
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
    preferencesQuery,
    setPreferencesMutation,
    resetToDefaultsMutation,
    setApiKeyMutation,
    apiKeysQuery,
  };
};
