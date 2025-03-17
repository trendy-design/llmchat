'use client';

import { Model, models } from '@repo/ai/models';
import Dexie, { Table } from 'dexie';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export enum ChatMode {
  Fast = "fast",
  Deep = "deep",
  GPT_4o_Mini = "gpt-4o-mini",
  GEMINI_2_FLASH = "gemini-flash-2.0"
}

export type Thread = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ItemStatus = 'PENDING' | 'COMPLETED' | 'ERROR';

export type Goal = {
  id: string;
  text: string;
  final: boolean;
  status?: ItemStatus;
}

export type Source = {
  title: string;
  link: string;
  index: number;
}




export type Step = {
  type: 'search' | 'read';
  queries?: string[];
  goalId: string;
  final: boolean;
  results?: Array<{
    title: string;
    link: string;
  }>;
}

export type GoalWithSteps = Goal & {
  steps: Step[];
}

export type Answer = {
  text: string;
  final: boolean;
  status?: ItemStatus;
}

export type Reasoning = {
  text: string;
  final: boolean;
  status?: ItemStatus;
}

export type ThreadItem = {
  query: string;
  goals?: Goal[];
  reasoning?: Reasoning;
  steps?: Step[];
  answer?: Answer;
  sources?: Source[];
  final?: boolean;
  status?: ItemStatus;
  createdAt: Date;
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
  currentSources: string[];
};

type Actions = {
  setModel: (model: Model) => void;
  setEditor: (editor: any) => void;
  setContext: (context: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  stopGeneration: () => void;
  setAbortController: (abortController: AbortController) => void;
  createThread: () => void;
  setChatMode: (chatMode:  ChatMode) => void;
  updateThread: (thread: Pick<Thread, 'id' | 'title'>) => Promise<void>;
  createThreadItem: (threadItem: ThreadItem) => Promise<void>;
  updateThreadItem: (threadItem: Partial<ThreadItem>) => Promise<void>;
  switchThread: (threadId: string) => void;
  deleteThreadItem: (threadItemId: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  getThreadItems: (threadId: string) => ThreadItem[];
  getCurrentThread: () => Thread | null;
  loadThreadItems: (threadId: string) => Promise<void>;
  setCurrentThreadItem: (threadItem: ThreadItem) => void;
  clearAllThreads: () => void;
  setCurrentSources: (sources: string[]) => void;
};

// Add these utility functions at the top level
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

const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
};

// Add batch update functionality
type BatchUpdateQueue = {
  items: ThreadItem[];
  timeoutId: NodeJS.Timeout | null;
};

const batchUpdateQueue: BatchUpdateQueue = {
  items: [],
  timeoutId: null
};

const processBatchUpdate = async () => {
  if (batchUpdateQueue.items.length === 0) return;
  
  const itemsToUpdate = [...batchUpdateQueue.items];
  batchUpdateQueue.items = [];
  
  try {
    await db.threadItems.bulkPut(itemsToUpdate);
  } catch (error) {
    console.error("Failed to batch update thread items:", error);
  }
};

const queueThreadItemForBatchUpdate = (threadItem: ThreadItem) => {
  const existingIndex = batchUpdateQueue.items.findIndex(item => item.id === threadItem.id);
  
  if (existingIndex !== -1) {
    batchUpdateQueue.items[existingIndex] = threadItem;
  } else {
    batchUpdateQueue.items.push(threadItem);
  }
  
  if (!batchUpdateQueue.timeoutId) {
    batchUpdateQueue.timeoutId = setTimeout(() => {
      processBatchUpdate();
      batchUpdateQueue.timeoutId = null;
    }, 100); // Process batch every 2 seconds
  }
};

const debouncedThreadUpdate = debounce((thread: Thread) => db.threads.put(thread), 1000);

const throttledThreadItemUpdate = throttle(
  (threadItem: ThreadItem) => queueThreadItemForBatchUpdate(threadItem),
  500
);

export const useChatStore = create(
  immer<State & Actions>((set, get) => ({
    model: models[0],
    isGenerating: false,
    editor: undefined,
    context: '',
    threads: [],
    chatMode: ChatMode.Fast,
    threadItems: [],
    currentThreadId: 'default',
    currentThread: null,
    currentThreadItem: null,
    messageGroups: [],
    abortController: null,
    isLoadingThreads: false,
    isLoadingThreadItems: false,
    currentSources: [],

    
    setChatMode: (chatMode: ChatMode) => {
      localStorage.setItem(CONFIG_KEY, JSON.stringify({ chatMode }));
      set(state => {
        state.chatMode = chatMode;
      });
    },
    
    setCurrentSources: (sources: string[]) => {
      set(state => {
        state.currentSources = sources;
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
      state.abortController?.abort();
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

        // Immediately update status changes in the database
        if(existingItem.status !== threadItem.status) {
          await db.threadItems.put(updatedItem);
        } else {
          // For other changes, use throttled batch updates
          throttledThreadItemUpdate(updatedItem);
        }

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
          return a.createdAt.getTime() - b.createdAt.getTime();
        });
    },

    getCurrentThread: () => {
      const state = get();
      return state.threads.find(t => t.id === state.currentThreadId) || null;
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
