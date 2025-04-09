'use client';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const SETTING_TABS = {
    API_KEYS: 'api-keys',
    MCP_TOOLS: 'mcp-tools',
    CREDITS: 'credits',
} as const;

type SideDrawerProps = {
    open: boolean;
    badge?: number;
    title: string | (() => React.ReactNode);
    renderContent: () => React.ReactNode;
};

type State = {
    isSidebarOpen: boolean;
    isSourcesOpen: boolean;
    isSettingsOpen: boolean;
    showSignInModal: boolean;
    settingTab: (typeof SETTING_TABS)[keyof typeof SETTING_TABS];
    sideDrawer: SideDrawerProps;
    openSideDrawer: (props: SideDrawerProps) => void;
    dismissSideDrawer: () => void;
};

type Actions = {
    setIsSidebarOpen: (prev: (prev: boolean) => boolean) => void;
    setIsSourcesOpen: (prev: (prev: boolean) => boolean) => void;
    setIsSettingsOpen: (open: boolean) => void;
    setSettingTab: (tab: (typeof SETTING_TABS)[keyof typeof SETTING_TABS]) => void;
    setShowSignInModal: (show: boolean) => void;
    openSideDrawer: (props: Omit<SideDrawerProps, 'open'>) => void;
    updateSideDrawer: (props: Partial<SideDrawerProps>) => void;
    dismissSideDrawer: () => void;
};

export const useAppStore = create(
    immer<State & Actions>((set, get) => ({
        isSidebarOpen: true,
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
        sideDrawer: { open: false, title: '', renderContent: () => null, badge: undefined },
        openSideDrawer: (props: Omit<SideDrawerProps, 'open'>) => {
            set({ sideDrawer: { ...props, open: true } });
        },
        updateSideDrawer: (props: Partial<SideDrawerProps>) =>
            set(state => ({
                sideDrawer: { ...state.sideDrawer, ...props },
            })),
        dismissSideDrawer: () =>
            set({
                sideDrawer: { open: false, title: '', renderContent: () => null, badge: undefined },
            }),
    }))
);
