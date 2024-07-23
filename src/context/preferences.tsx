"use client";
import { defaultPreferences } from "@/config";
import { usePreferences } from "@/hooks/use-preferences";
import { TApiKeys, TBaseModel, TPreferences } from "@/types";
import moment from "moment";
import { useEffect, useState } from "react";

import { createContext, useContext } from "react";

export type TPreferenceContext = {
  preferences: TPreferences;
  updatePreferences: (
    newPreferences: Partial<TPreferences>,
    onSuccess?: (preference: TPreferences) => void
  ) => void;
  apiKeys: TApiKeys;
  updateApiKey: (key: TBaseModel, value: string) => void;
  updateApiKeys: (newApiKeys: TApiKeys) => void;
  injectPresetValues: (prompt: string) => string;
};

export const PreferenceContext = createContext<undefined | TPreferenceContext>(
  undefined
);

export const usePreferenceContext = () => {
  const context = useContext(PreferenceContext);
  if (context === undefined) {
    throw new Error("usePreference must be used within a PreferencesProvider");
  }
  return context;
};

export type TPreferencesProvider = {
  children: React.ReactNode;
};

export const PreferenceProvider = ({ children }: TPreferencesProvider) => {
  const {
    preferencesQuery,
    setPreferencesMutation,
    apiKeysQuery,
    setApiKeyMutation,
  } = usePreferences();
  const [preferences, setPreferences] =
    useState<TPreferences>(defaultPreferences);
  const [apiKeys, setApiKeys] = useState<TApiKeys>({});

  useEffect(() => {
    preferencesQuery.data &&
      setPreferences({ ...defaultPreferences, ...preferencesQuery.data });
  }, [preferencesQuery.data]);

  useEffect(() => {
    apiKeysQuery.data && setApiKeys(apiKeysQuery.data);
  }, [apiKeysQuery.data]);

  const presetValues = {
    "{{local_date}}": moment().format("YYYY-MM-DD"),
    "{{local_time}}": moment().format("HH:mm:ss"),
    "{{local_datetime}}": moment().format("YYYY-MM-DD HH:mm:ss"),
  };

  const updatePreferences = async (
    newPreferences: Partial<TPreferences>,
    onSuccess?: (preference: TPreferences) => void
  ) => {
    setPreferences({ ...preferences, ...newPreferences });
    setPreferencesMutation.mutate(newPreferences, {
      onSuccess: () => {
        preferencesQuery.refetch();
        onSuccess && onSuccess(preferences);
      },
    });
  };

  const updateApiKey = async (key: TBaseModel, value: string) => {
    setApiKeys({ ...apiKeys, [key]: value });
    setApiKeyMutation.mutate({ key, value });
  };
  useEffect(() => {
    updateApiKey("ollama", "kdskdmkmsd");
  }, []);

  const updateApiKeys = (newApiKeys: TApiKeys) => {
    setApiKeys(newApiKeys);
  };

  const injectPresetValues = (prompt: string) => {
    return prompt.replace(
      /{{.*?}}/g,
      (match) => presetValues?.[match as keyof typeof presetValues] || match
    );
  };
  return (
    <PreferenceContext.Provider
      value={{
        preferences,
        injectPresetValues,
        updatePreferences,
        apiKeys,
        updateApiKey,
        updateApiKeys,
      }}
    >
      {children}
    </PreferenceContext.Provider>
  );
};
