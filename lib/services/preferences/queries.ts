import { preferencesService } from "@/lib/services/preferences/client";
import { TPreferences } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const usePreferencesQueries = () => {
  const preferencesQuery = useQuery({
    queryKey: ["preferences"],
    queryFn: () => preferencesService.getPreferences(),
  });

  const apiKeysQuery = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => preferencesService.getApiKeys(),
  });

  const setPreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<TPreferences>) =>
      await preferencesService.setPreferences(preferences),
    onSuccess() {
      preferencesQuery.refetch();
    },
  });

  const setApiKeyMutation = useMutation({
    mutationFn: async ({ key, value }: any) =>
      preferencesService.setApiKey(key, value),
    onSuccess: () => {
      apiKeysQuery.refetch();
    },
  });

  const resetToDefaultsMutation = useMutation({
    mutationFn: () => preferencesService.resetToDefaults(),
    onSuccess: () => {
      preferencesQuery.refetch();
    },
  });

  return {
    preferencesQuery,
    setPreferencesMutation,
    resetToDefaultsMutation,
    setApiKeyMutation,
    apiKeysQuery,
  };
};
