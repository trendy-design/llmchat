'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type McpConfig = {
    url: string;
    tools: string[];
    status: 'pending' | 'success' | 'error';
};

type McpState = {
    mcpConfig: Record<string, McpConfig>;
    selectedMCP: string[];
};

type McpActions = {
    setMcpConfig: (mcpConfig: Record<string, McpConfig>) => void;
    addMcpConfig: (mcpConfig: Record<string, McpConfig>) => void;
    removeMcpConfig: (key: string) => void;
    getMcpConfig: () => Record<string, McpConfig>;
    updateSelectedMCP: (updater: (prev: string[]) => string[]) => void;
    getSelectedMCP: () => Record<string, string>;
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
                        acc[mcp] = mcpConfig[mcp].url;
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

            setMcpConfig: (mcpConfig: Record<string, McpConfig>) => {
                set(state => {
                    state.mcpConfig = mcpConfig;
                });
            },

            addMcpConfig: (mcpConfig: Record<string, McpConfig>) => {
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
