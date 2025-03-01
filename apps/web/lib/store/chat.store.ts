'use client';

import { AgentEventPayload } from '@repo/ai';
import { Model, models } from '@repo/ai/models';
import Dexie, { Table } from 'dexie';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type Thread = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Block = {
  id: string;
  nodeKey: string;
  content: string;
  toolCalls?: AgentEventPayload['toolCalls'];
  toolCallResults?: AgentEventPayload['toolCallResults'];
  nodeStatus?: 'pending' | 'completed' | 'error';
  tokenUsage?: number;
  history?: AgentEventPayload['history'];
  nodeInput?: string;
  sources?: string[];
  nodeModel?: string;
  nodeReasoning?: string;
  isStep?: boolean;
  nodeError?: string;
};

export type ThreadItem = {
  role: 'user' | 'assistant';
  content: Block[];
  createdAt: Date;
  status: 'pending' | 'completed' | 'error';
  updatedAt: Date;
  id: string;
  parentId?: string;
  threadId: string;
  metadata?: Record<string, any>;
};

export type MessageGroup = {
  userMessage: ThreadItem;
  assistantMessages: ThreadItem[];
};

class ThreadDatabase extends Dexie {
  threads!: Table<Thread>;
  threadItems!: Table<ThreadItem>;

  constructor() {
    super('ThreadDatabase');
    this.version(1).stores({
      threads: 'id, createdAt',
      threadItems: 'id, threadId, parentId, createdAt',
    });
  }
}

let db: ThreadDatabase;
let CONFIG_KEY = 'chat-config';
if (typeof window !== 'undefined') {
  db = new ThreadDatabase();
  CONFIG_KEY = 'chat-config';
}

const loadInitialData = async () => {
  const threads = await db.threads.toArray();
  const configStr = localStorage.getItem(CONFIG_KEY);
  const config = configStr
    ? JSON.parse(configStr)
    : {
        model: models[0].id,
        currentThreadId: 'default',
      };

  const initialThreads = threads.length
    ? threads
    : [{ id: 'default', title: 'New Thread', createdAt: new Date(), updatedAt: new Date() }];

  return {
    threads: initialThreads,
    model: models.find(m => m.id === config.model) || models[0],
    currentThreadId: config.currentThreadId || initialThreads[0].id,
  };
};


type ChatMode = 'fast' | 'deep';

type State = {
  model: Model;
  isGenerating: boolean;
  editor: any;
  chatMode: ChatMode;
  context: string;
  abortController: AbortController | null;
  threads: Thread[];
  threadItems: ThreadItem[];
  currentThreadId: string;
  currentThread: Thread | null;
  currentThreadItem: ThreadItem | null;
  messageGroups: MessageGroup[];
  isLoadingThreads: boolean;
  isLoadingThreadItems: boolean;
};

type Actions = {
  setModel: (model: Model) => void;
  setEditor: (editor: any) => void;
  setContext: (context: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  stopGeneration: () => void;
  setAbortController: (abortController: AbortController) => void;
  createThread: () => void;
  setChatMode: (chatMode: ChatMode) => void;
  updateThread: (thread: Pick<Thread, 'id' | 'title'>) => Promise<void>;
  createThreadItem: (threadItem: ThreadItem) => Promise<void>;
  updateThreadItem: (threadItem: Partial<ThreadItem>) => Promise<void>;
  switchThread: (threadId: string) => void;
  deleteThreadItem: (threadItemId: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  getThreadItems: (threadId: string) => ThreadItem[];
  getCurrentThread: () => Thread | null;
  loadThreadItems: (threadId: string) => Promise<void>;
  getMessageGroups: (threadId: string) => MessageGroup[];
  setCurrentThreadItem: (threadItem: ThreadItem) => void;
  clearAllThreads: () => void;
};

// Add this debounce utility at the top level
const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const debouncedThreadUpdate = debounce((thread: Thread) => db.threads.put(thread), 1000);

const debouncedThreadItemUpdate = debounce(
  (threadItem: ThreadItem) => db.threadItems.put(threadItem),
  1000
);

export const useChatStore = create(
  immer<State & Actions>((set, get) => ({
    model: models[0],
    isGenerating: false,
    editor: undefined,
    context: '',
    threads: [],
    chatMode: 'fast',
    threadItems: [],
    currentThreadId: 'default',
    currentThread: null,
    currentThreadItem: null,
    messageGroups: [],
    abortController: null,
    isLoadingThreads: false,
    isLoadingThreadItems: false,
    
    setChatMode: (chatMode: ChatMode) => {
      localStorage.setItem(CONFIG_KEY, JSON.stringify({ chatMode }));
      set(state => {
        state.chatMode = chatMode;
      });
    },
    
    setCurrentThreadItem: threadItem => set(state => {
      state.currentThreadItem = threadItem;
    }),
    
    setEditor: editor => set(state => {
      state.editor = editor;
    }),
    
    setContext: context => set(state => {
      state.context = context;
    }),
    
    setIsGenerating: isGenerating => set(state => {
      state.isGenerating = isGenerating;
    }),
    
    stopGeneration: () => set(state => {
      state.isGenerating = false;
    }),
    
    setAbortController: abortController => set(state => {
      state.abortController = abortController;
    }),
    
    loadThreadItems: async (threadId: string) => {
      const threadItems = await db.threadItems.where('threadId').equals(threadId).toArray();
      set(state => {
        state.threadItems = threadItems;
      });
    },

    clearAllThreads: async () => {
      await db.threads.clear();
      await db.threadItems.clear();
      set(state => {
        state.threads = [];
        state.threadItems = [];
      });
    },

    createThread: async () => {
      const newThread = {
        id: nanoid(),
        title: 'New Thread',
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      await db.threads.add(newThread);
      set(state => {
        state.threads.push(newThread);
        state.currentThreadId = newThread.id;
        state.currentThread = newThread;
      });
    },

    setModel: async (model: Model) => {
      localStorage.setItem(CONFIG_KEY, JSON.stringify({ model: model.id }));
      set(state => {
        state.model = model;
      });
    },

    updateThread: async thread => {
      const existingThread = get().threads.find(t => t.id === thread.id);
      if (!existingThread) return;
      
      const updatedThread: Thread = {
        ...existingThread,
        ...thread,
        updatedAt: new Date(),
      };
      
      set(state => {
        const index = state.threads.findIndex((t: Thread) => t.id === thread.id);
        if (index !== -1) {
          state.threads[index] = updatedThread;
        }
        if (state.currentThreadId === thread.id) {
          state.currentThread = updatedThread;
        }
      });
      
      try {
        await db.threads.put(updatedThread);
      } catch (error) {
        console.error("Failed to update thread in database:", error);
      }
    },

    createThreadItem: async threadItem => {
      const threadId = get().currentThreadId;
      await db.threadItems.add(threadItem);
      set(state => {
        state.threadItems.push({ ...threadItem, threadId });
      });
    },

    updateThreadItem: async threadItem => {
      if (!threadItem.id) return;

      const existingItem = await db.threadItems.get(threadItem.id);
      if (existingItem) {
        const updatedItem = { ...existingItem, ...threadItem, threadId: get().currentThreadId };

        if(existingItem.status !== threadItem.status) {
          await db.threadItems.put(updatedItem);
        }

        debouncedThreadItemUpdate(updatedItem);
        set(state => {
          const index = state.threadItems.findIndex((t: ThreadItem) => t.id === threadItem.id);
          if (index !== -1) {
            state.threadItems[index] = updatedItem;
          }
        });
      }
    },

    switchThread: async (threadId: string) => {
      const thread = get().threads.find(t => t.id === threadId);
      localStorage.setItem(
        CONFIG_KEY,
        JSON.stringify({
          model: get().model.id,
          currentThreadId: threadId,
        })
      );
      set(state => {
        state.currentThreadId = threadId;
        state.currentThread = thread || null;
      });
      await get().loadThreadItems(threadId);
    },

    deleteThreadItem: async threadItemId => {
      await db.threadItems.delete(threadItemId);
      set(state => {
        state.threadItems = state.threadItems.filter((t: ThreadItem) => t.id !== threadItemId);
      });
    },

    deleteThread: async threadId => {
      await db.threads.delete(threadId);
      await db.threadItems.where('threadId').equals(threadId).delete();
      set(state => {
        state.threads = state.threads.filter((t: Thread) => t.id !== threadId);
        state.currentThreadId = state.threads[0]?.id || 'default';
        state.currentThread = state.threads[0] || null;
      });
    },

    getThreadItems: threadId => {
      const state = get();
      return state.threadItems
        .filter(item => item.threadId === threadId)
        .sort((a, b) => {
          if (a.role !== b.role) return a.role === 'user' ? -1 : 1;
          return a.createdAt.getTime() - b.createdAt.getTime();
        });
    },

    getCurrentThread: () => {
      const state = get();
      return state.threads.find(t => t.id === state.currentThreadId) || null;
    },

    getMessageGroups: (threadId: string) => {
      const threadItems = get().getThreadItems(threadId);
      const assistantMsgs = threadItems.filter(item => item.role === 'assistant');
      const userMsgs = threadItems.filter(item => item.role === 'user');

      return userMsgs.map(userMessage => ({
        userMessage,
        assistantMessages: assistantMsgs.filter(
          assistantMsg => assistantMsg.parentId === userMessage.id
        ),
      }));
    },
  }))
);

if (typeof window !== 'undefined') {
  // Initialize store with data from IndexedDB
  loadInitialData().then(({ threads, model, currentThreadId }) => {
    useChatStore.setState({
    threads,
    model,
    currentThreadId,
    currentThread: threads.find(t => t.id === currentThreadId) || threads?.[0],
  });
});

}
