import { defaultPreferences } from "@/config";
import { TApiKeys, TPreferences, TPreferencesState } from "@/lib/types";
import { create } from "zustand";

const initialState = {
  preferences: defaultPreferences,
  apiKeys: [],
};

export const createPreferencesStore = () =>
  create<TPreferencesState>((set, get) => ({
    ...initialState,
    setPreferences: (preferences: Partial<TPreferences>) => {
      const existingPreferences = get().preferences;
      set({ preferences: { ...existingPreferences, ...preferences } });
    },
    setApiKeys: (apiKeys: TApiKeys[]) => {
      set({ apiKeys });
    },
  }));
