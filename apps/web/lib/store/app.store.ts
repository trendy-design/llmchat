'use client';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type State = {
  isSidebarOpen: boolean;
  isSourcesOpen: boolean;
};

type Actions = {
  setIsSidebarOpen: (prev: (prev: boolean) => boolean) => void;
  setIsSourcesOpen: (prev: (prev: boolean) => boolean) => void;
};

export const useAppStore = create(
  immer<State & Actions>((set, get) => ({
    isSidebarOpen: false,
    isSourcesOpen: false,
    setIsSidebarOpen: (prev: (prev: boolean) => boolean) => set({ isSidebarOpen: prev(get().isSidebarOpen) }),
    setIsSourcesOpen: (prev: (prev: boolean) => boolean) => set({ isSourcesOpen: prev(get().isSourcesOpen) }),
  }))
);
