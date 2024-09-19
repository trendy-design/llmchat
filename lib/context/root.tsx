"use client";
import initHotjar from "@/libs/utils/hotjar";
import { TProvider } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

export type RootContextType = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  isCommandSearchOpen: boolean;
  setIsCommandSearchOpen: (isCommandSearchOpen: boolean) => void;
  openApiKeyModal: boolean;
  setOpenApiKeyModal: (openApiKeyModal: boolean) => void;
  apiKeyModalProvider: TProvider | null;
  setApiKeyModalProvider: (apiKeyModalProvider: TProvider | null) => void;
};

export const RootContext = createContext<RootContextType>({
  isSidebarOpen: true,
  setIsSidebarOpen: (isSidebarOpen: boolean) => {},
  isCommandSearchOpen: false,
  setIsCommandSearchOpen: (isCommandSearchOpen: boolean) => {},
  openApiKeyModal: false,
  setOpenApiKeyModal: (openApiKeyModal: boolean) => {},
  apiKeyModalProvider: null,
  setApiKeyModalProvider: (apiKeyModalProvider: TProvider | null) => {},
});

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    initHotjar();
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);
  const [openApiKeyModal, setOpenApiKeyModal] = useState(false);
  const [apiKeyModalProvider, setApiKeyModalProvider] =
    useState<TProvider | null>(null);

  return (
    <RootContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        isCommandSearchOpen,
        setIsCommandSearchOpen,
        openApiKeyModal,
        setOpenApiKeyModal,
        apiKeyModalProvider,
        setApiKeyModalProvider,
      }}
    >
      {children}
    </RootContext.Provider>
  );
};

export const useRootContext = () => {
  const context = useContext(RootContext);
  if (!context) {
    throw new Error("useRootContext must be used within a RootProvider");
  }
  return context;
};
