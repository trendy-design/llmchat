import { ChatMode } from '@repo/shared/config';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ApiKeys = {
    OPENAI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    GEMINI_API_KEY?: string;
    JINA_API_KEY?: string;
    FIREWORKS_API_KEY?: string;
    SERPER_API_KEY?: string;
};

type ApiKeysState = {
    keys: ApiKeys;
    setKey: (provider: keyof ApiKeys, key: string) => void;
    removeKey: (provider: keyof ApiKeys) => void;
    clearAllKeys: () => void;
    getAllKeys: () => ApiKeys;
    hasApiKeyForChatMode: (chatMode: ChatMode) => boolean;
};

export const useApiKeysStore = create<ApiKeysState>()(
    persist(
        (set, get) => ({
            keys: {},
            setKey: (provider, key) =>
                set(state => ({
                    keys: { ...state.keys, [provider]: key },
                })),
            removeKey: provider =>
                set(state => {
                    const newKeys = { ...state.keys };
                    delete newKeys[provider];
                    return { keys: newKeys };
                }),
            clearAllKeys: () => set({ keys: {} }),
            getAllKeys: () => get().keys,
            hasApiKeyForChatMode: (chatMode: ChatMode) => {
                const apiKeys = get().keys;
                switch (chatMode) {
                    case ChatMode.O3_Mini:
                    case ChatMode.GPT_4o_Mini:
                        return !!apiKeys['OPENAI_API_KEY'];
                    case ChatMode.GEMINI_2_FLASH:
                        return !!apiKeys['GEMINI_API_KEY'];
                    case ChatMode.CLAUDE_3_5_SONNET:
                    case ChatMode.CLAUDE_3_7_SONNET:
                        return !!apiKeys['ANTHROPIC_API_KEY'];
                    case ChatMode.DEEPSEEK_R1:
                        return !!apiKeys['FIREWORKS_API_KEY'];
                    default:
                        return false;
                }
            },
        }),
        {
            name: 'api-keys-storage',
        }
    )
);
