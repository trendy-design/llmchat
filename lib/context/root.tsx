"use client";
import initHotjar from "@/libs/utils/hotjar";
import { createContext, useContext, useEffect, useState } from "react";

export type RootContextType = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  isCommandSearchOpen: boolean;
  setIsCommandSearchOpen: (isCommandSearchOpen: boolean) => void;
};

export const RootContext = createContext<RootContextType>({
  isSidebarOpen: true,
  setIsSidebarOpen: (isSidebarOpen: boolean) => {},
  isCommandSearchOpen: false,
  setIsCommandSearchOpen: (isCommandSearchOpen: boolean) => {},
});

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    initHotjar();
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);

  return (
    <RootContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        isCommandSearchOpen,
        setIsCommandSearchOpen,
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
