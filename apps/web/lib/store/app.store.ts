'use client';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const SETTING_TABS = {
    API_KEYS: 'api-keys',
    MCP_TOOLS: 'mcp-tools',
    CREDITS: 'credits',
} as const;

type State = {
    isSidebarOpen: boolean;
    isSourcesOpen: boolean;
    isSettingsOpen: boolean;
    showSignInModal: boolean;
    settingTab: (typeof SETTING_TABS)[keyof typeof SETTING_TABS];
};

type Actions = {
    setIsSidebarOpen: (prev: (prev: boolean) => boolean) => void;
    setIsSourcesOpen: (prev: (prev: boolean) => boolean) => void;
    setIsSettingsOpen: (open: boolean) => void;
    setSettingTab: (tab: (typeof SETTING_TABS)[keyof typeof SETTING_TABS]) => void;
    setShowSignInModal: (show: boolean) => void;
};

export const useAppStore = create(
    immer<State & Actions>((set, get) => ({
        isSidebarOpen: false,
        isSourcesOpen: false,
        isSettingsOpen: false,
        settingTab: 'api-keys',
        showSignInModal: false,
        setIsSidebarOpen: (prev: (prev: boolean) => boolean) =>
            set({ isSidebarOpen: prev(get().isSidebarOpen) }),
        setIsSourcesOpen: (prev: (prev: boolean) => boolean) =>
            set({ isSourcesOpen: prev(get().isSourcesOpen) }),
        setIsSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),
        setSettingTab: (tab: (typeof SETTING_TABS)[keyof typeof SETTING_TABS]) =>
            set({ settingTab: tab }),
        setShowSignInModal: (show: boolean) => set({ showSignInModal: show }),
    }))
);
