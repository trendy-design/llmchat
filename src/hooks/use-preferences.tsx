import { defaultPreferences } from "@/config";
import { TApiKeys, TPreferences, TProvider } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { get, set } from "idb-keyval";

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

  const setApiKey = async (key: TProvider, value: string) => {
    const keys = await getApiKeys();
    const newKeys = { ...keys, [key]: value };
    await set("api-keys", newKeys);
  };

  const getApiKey = async (key: TProvider) => {
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
