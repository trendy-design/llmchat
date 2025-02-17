"use client";

import { AgentEventPayload } from "@repo/ai";
import { Model, models } from "@repo/ai/models";
import Dexie, { Table } from "dexie";
import { nanoid } from "nanoid";
import { create } from "zustand";

export type Thread = {
  id: string;
  title: string;
  createdAt: Date;
}

export type Block = {
  id: string;
  nodeKey: string;
  content: string;
  toolCalls?: AgentEventPayload['toolCalls'];
  toolCallResults?: AgentEventPayload['toolCallResults'];
  nodeStatus?: "pending" | "completed" | "error";
  tokenUsage?: number;
  nodeInput?: string;
  nodeModel?: string;
}

export type ThreadItem = {
  role: "user" | "assistant";
  content: Block[];
  createdAt: Date;
  status: "pending" | "completed" | "error";
  updatedAt: Date;
  id: string;
  parentId?: string;
  threadId: string;
  metadata?: Record<string, any>;
}

export type MessageGroup = {
  userMessage: ThreadItem;
  assistantMessages: ThreadItem[];
}

class ThreadDatabase extends Dexie {
  threads!: Table<Thread>;
  threadItems!: Table<ThreadItem>;

  constructor() {
    super("ThreadDatabase");
    this.version(1).stores({
      threads: "id, createdAt",
      threadItems: "id, threadId, parentId, createdAt"
    });
  }
}

const db = new ThreadDatabase();
const CONFIG_KEY = "chat-config";

const loadInitialData = async () => {
  const threads = await db.threads.toArray();
  const configStr = localStorage.getItem(CONFIG_KEY);
  const config = configStr ? JSON.parse(configStr) : { 
    model: models[0].id,
    currentThreadId: "default"
  };

  
  const initialThreads = threads.length ? threads : [{ id: "default", title: "New Thread", createdAt: new Date() }];
  
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
}

type Actions = {
  setModel: (model: Model) => void;
  setEditor: (editor: any) => void;
  setContext: (context: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  stopGeneration: () => void;
  setAbortController: (abortController: AbortController) => void;
  createThread: () => void;
  updateThread: (thread: Thread) => Promise<void>;
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
}

export const useChatStore = create<State & Actions>((set, get) => ({
  model: models[0],
  isGenerating: false,
  editor: undefined,
  context: "",
  threads: [],
  threadItems: [],
  currentThreadId: "default",
  currentThread: null,
  currentThreadItem: null,
  messageGroups: [],
  abortController: null,
  isLoadingThreads: false,
  isLoadingThreadItems: false,
  setCurrentThreadItem: (threadItem) => set({ currentThreadItem: threadItem }),
  setEditor: (editor) => set({ editor }),
  setContext: (context) => set({ context }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  stopGeneration: () => set({ isGenerating: false }),
  setAbortController: (abortController) => set({ abortController }),
  loadThreadItems: async (threadId: string) => {
    const threadItems = await db.threadItems.where("threadId").equals(threadId).toArray();
    set({ threadItems });
  },

  createThread: async () => {
    const newThread = {
      id: nanoid(),
      title: "New Thread",
      createdAt: new Date(),
    };
    await db.threads.add(newThread);
    set((state) => ({
      threads: [...state.threads, newThread],
      currentThreadId: newThread.id,
      currentThread: newThread,
    }));
  },

  setModel: async (model: Model) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ model: model.id }));
    set({ model });
  },

  updateThread: async (thread) => {
    await db.threads.put(thread);
    set((state) => ({
      threads: state.threads.map((t) => (t.id === thread.id ? thread : t)),
    }));
  },

  createThreadItem: async (threadItem) => {
    const threadId = get().currentThreadId;
    await db.threadItems.add(threadItem);
    set((state) => ({
      threadItems: [...state.threadItems, {...threadItem, threadId }],
    }));
  },

  updateThreadItem: async (threadItem) => {
    console.log('updateThreadItem', threadItem);

    const threadId = get().currentThreadId;
    if (!threadItem.id) return;
    const existingItem = await db.threadItems.get(threadItem.id);
    if (existingItem) {
      const updatedItem = { ...existingItem, ...threadItem, threadId };
      await db.threadItems.put(updatedItem);
      set((state) => ({
        threadItems: state.threadItems.map((t) =>
          t.id === threadItem.id ? updatedItem : t
        ),
      }));
    }
  },

  switchThread: async (threadId: string) => {
    const thread = get().threads.find(t => t.id === threadId);
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ 
      model: get().model.id, 
      currentThreadId: threadId 
    }));
    set({ 
      currentThreadId: threadId,
      currentThread: thread || null 
    });
    await get().loadThreadItems(threadId);
  },

  deleteThreadItem: async (threadItemId) => {
    await db.threadItems.delete(threadItemId);
    set((state) => ({
      threadItems: state.threadItems.filter((t) => t.id !== threadItemId),
    }));
  },

  deleteThread: async (threadId) => {
    await db.threads.delete(threadId);
    await db.threadItems.where("threadId").equals(threadId).delete();
    set((state) => ({
      threads: state.threads.filter((t) => t.id !== threadId),
      currentThreadId: state.threads[0]?.id || "default",
      currentThread: state.threads[0] || null,
    }));
  },

  getThreadItems: (threadId) => {
    const state = get();
    return state.threadItems
      .filter((item) => item.threadId === threadId)
      .sort((a, b) => {
        if (a.role !== b.role) return a.role === "user" ? -1 : 1;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  },

  getCurrentThread: () => {
    const state = get();
    return state.threads.find(t => t.id === state.currentThreadId) || null;
  },

  getMessageGroups: (threadId: string) => {
    const threadItems = get().getThreadItems(threadId);
    
    const assistantMsgs = threadItems.filter(
      (item) => item.role === "assistant"
    );
    
    const userMsgs = threadItems.filter(
      (item) => item.role === "user"
    );

    return userMsgs.map((userMessage) => ({
      userMessage,
      assistantMessages: assistantMsgs.filter(
        (assistantMsg) => assistantMsg.parentId === userMessage.id
      ),
    }));
  },
}));

// Initialize store with data from IndexedDB
loadInitialData().then(({ threads, model, currentThreadId }) => {
  useChatStore.setState({ 
    threads, 
    model,
    currentThreadId,
    currentThread: threads.find(t => t.id === currentThreadId) || threads?.[0],
  });
});
