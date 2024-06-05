"use client";
import { usePreferences } from "@/hooks/use-preferences";
import { PreferenceContext } from "./context";

export type TPreferencesProvider = {
  children: React.ReactNode;
};

export const PreferenceProvider = ({ children }: TPreferencesProvider) => {
  const preferences = usePreferences();
  return (
    <PreferenceContext.Provider value={preferences}>
      {children}
    </PreferenceContext.Provider>
  );
};
