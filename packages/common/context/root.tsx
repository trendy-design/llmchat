'use client';
import { initHotjar } from '@repo/shared/utils';
import { createContext, useContext, useEffect, useState } from 'react';

export type RootContextType = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  isCommandSearchOpen: boolean;
  setIsCommandSearchOpen: (isCommandSearchOpen: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (isMobileSidebarOpen: boolean) => void;
};

export const RootContext = createContext<RootContextType | null>(null);

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    initHotjar();
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);

  return (
    <RootContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        isCommandSearchOpen,
        setIsCommandSearchOpen,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
      }}
    >
      {children}
    </RootContext.Provider>
  );
};

export const useRootContext = () => {
  const context = useContext(RootContext);
  if (!context) {
    throw new Error('useRootContext must be used within a RootProvider');
  }
  return context;
};
