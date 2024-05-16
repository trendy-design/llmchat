"use client";

import { createContext, useContext } from "react";

export type TSettingsContext = {
  open: (menu?: string) => void;
  dismiss: () => void;
};
export const SettingsContext = createContext<undefined | TSettingsContext>(
  undefined
);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingssProvider");
  }
  return context;
};
