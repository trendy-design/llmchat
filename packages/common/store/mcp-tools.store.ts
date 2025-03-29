'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type McpState = {
    mcpConfig: Record<string, string>;
    selectedMCP: string[];
};

type McpActions = {
    setMcpConfig: (mcpConfig: Record<string, string>) => void;
    addMcpConfig: (mcpConfig: Record<string, string>) => void;
    removeMcpConfig: (key: string) => void;
    getMcpConfig: () => Record<string, string>;
    getSelectedMCP: () => Record<string, string>;
    updateSelectedMCP: (updater: (prev: string[]) => string[]) => void;
};

export const useMcpToolsStore = create<McpState & McpActions>()(
    persist(
        immer((set, get) => ({
            mcpConfig: {},
            selectedMCP: [],
            getSelectedMCP: () => {
                const selectedMCP = get().selectedMCP;
                const mcpConfig = get().mcpConfig;
                return selectedMCP.reduce(
                    (acc, mcp) => {
                        acc[mcp] = mcpConfig[mcp];
                        return acc;
                    },
                    {} as Record<string, string>
                );
            },

            updateSelectedMCP: (updater: (prev: string[]) => string[]) => {
                set(state => {
                    state.selectedMCP = updater(state.selectedMCP);
                });
            },

            setMcpConfig: (mcpConfig: Record<string, string>) => {
                set(state => {
                    state.mcpConfig = mcpConfig;
                });
            },

            addMcpConfig: (mcpConfig: Record<string, string>) => {
                set(state => {
                    state.mcpConfig = { ...state.mcpConfig, ...mcpConfig };
                });
            },

            removeMcpConfig: (key: string) => {
                set(state => {
                    const newMcpConfig = { ...state.mcpConfig };
                    delete newMcpConfig[key];
                    state.mcpConfig = newMcpConfig;
                });
            },

            getMcpConfig: () => {
                return get().mcpConfig;
            },
        })),
        {
            name: 'mcp-tools-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
