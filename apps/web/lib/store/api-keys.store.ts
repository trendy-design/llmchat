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
};

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set, get) => ({
      keys: {},
      setKey: (provider, key) => 
        set((state) => ({
          keys: { ...state.keys, [provider]: key }
        })),
      removeKey: (provider) => 
        set((state) => {
          const newKeys = { ...state.keys };
          delete newKeys[provider];
          return { keys: newKeys };
        }),
      clearAllKeys: () => set({ keys: {} }),
      getAllKeys: () => get().keys,
    }),
    {
      name: 'api-keys-storage',
      skipHydration: true,
      // Only use storage in browser context
      storage: typeof window !== 'undefined' 
        ? {
            getItem: (name) => {
              const str = localStorage.getItem(name);
              return str ? JSON.parse(str) : null;
            },
            setItem: (name, value) => {
              localStorage.setItem(name, JSON.stringify(value));
            },
            removeItem: (name) => localStorage.removeItem(name),
          }
        : undefined,
    }
  )
);
