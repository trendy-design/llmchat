'use client';

import { Model, models } from '@repo/ai/models';
import { ChatMode } from '@repo/shared/config';
import { MessageGroup, Thread, ThreadItem } from '@repo/shared/types';
import Dexie, { Table } from 'dexie';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useAppStore } from './app.store';

class ThreadDatabase extends Dexie {
    threads!: Table<Thread>;
    threadItems!: Table<ThreadItem>;

    constructor() {
        super('ThreadDatabase');
        this.version(1).stores({
            threads: 'id, createdAt, pinned, pinnedAt',
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
              useWebSearch: false,
              showSuggestions: true,
              chatMode: ChatMode.GPT_4o_Mini,
          };
    const chatMode = config.chatMode || ChatMode.GPT_4o_Mini;
    const useWebSearch = typeof config.useWebSearch === 'boolean' ? config.useWebSearch : false;

    const initialThreads = threads.length ? threads : [];

    return {
        threads: initialThreads.sort((a, b) => b.createdAt?.getTime() - a.createdAt?.getTime()),
        currentThreadId: config.currentThreadId || initialThreads[0]?.id,
        config,
        useWebSearch,
        chatMode,
        showSuggestions: config.showSuggestions ?? true,
    };
};

type State = {
    model: Model;
    isGenerating: boolean;
    useWebSearch: boolean;
    showSuggestions: boolean;
    editor: any;
    chatMode: ChatMode;
    context: string;
    imageAttachment: { base64?: string; file?: File };
    abortController: AbortController | null;
    threads: Thread[];
    threadItems: ThreadItem[];
    currentThreadId: string | null;
    currentThread: Thread | null;
    currentThreadItem: ThreadItem | null;
    messageGroups: MessageGroup[];
    isLoadingThreads: boolean;
    isLoadingThreadItems: boolean;
    currentSources: string[];
    creditLimit: {
        remaining: number | undefined;
        maxLimit: number | undefined;
        reset: string | undefined;
        isAuthenticated: boolean;
        isFetched: boolean;
    };
};

type Actions = {
    setModel: (model: Model) => void;
    setEditor: (editor: any) => void;
    setContext: (context: string) => void;
    fetchRemainingCredits: () => Promise<void>;
    setImageAttachment: (imageAttachment: { base64?: string; file?: File }) => void;
    clearImageAttachment: () => void;
    setIsGenerating: (isGenerating: boolean) => void;
    stopGeneration: () => void;
    setAbortController: (abortController: AbortController) => void;
    createThread: (optimisticId: string, thread?: Pick<Thread, 'title'>) => Promise<Thread>;
    setChatMode: (chatMode: ChatMode) => void;
    updateThread: (thread: Pick<Thread, 'id' | 'title'>) => Promise<void>;
    getThread: (threadId: string) => Promise<Thread | null>;
    pinThread: (threadId: string) => Promise<void>;
    unpinThread: (threadId: string) => Promise<void>;
    createThreadItem: (threadItem: ThreadItem) => Promise<void>;
    updateThreadItem: (threadId: string, threadItem: Partial<ThreadItem>) => Promise<void>;
    switchThread: (threadId: string) => void;

    deleteThreadItem: (threadItemId: string) => Promise<void>;
    deleteThread: (threadId: string) => Promise<void>;
    getPreviousThreadItems: (threadId?: string) => ThreadItem[];
    getCurrentThreadItem: (threadId?: string) => ThreadItem | null;
    getCurrentThread: () => Thread | null;
    removeFollowupThreadItems: (threadItemId: string) => Promise<void>;
    getThreadItems: (threadId: string) => Promise<ThreadItem[]>;
    loadThreadItems: (threadId: string) => Promise<void>;
    setCurrentThreadItem: (threadItem: ThreadItem) => void;
    clearAllThreads: () => void;
    setCurrentSources: (sources: string[]) => void;
    setUseWebSearch: (useWebSearch: boolean) => void;
    setShowSuggestions: (showSuggestions: boolean) => void;
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
const DB_UPDATE_THROTTLE = 1000; // 1 second between updates for the same item
const BATCH_PROCESS_INTERVAL = 500; // Process batches every 500ms

// Track the last time each item was updated
const lastItemUpdateTime: Record<string, number> = {};

// Enhanced batch update queue
type BatchUpdateQueue = {
    items: Map<string, ThreadItem>; // Use Map to ensure uniqueness by ID
    timeoutId: NodeJS.Timeout | null;
};

const batchUpdateQueue: BatchUpdateQueue = {
    items: new Map(),
    timeoutId: null,
};

// Process all queued updates as a batch
const processBatchUpdate = async () => {
    if (batchUpdateQueue.items.size === 0) return;

    const itemsToUpdate = Array.from(batchUpdateQueue.items.values());
    batchUpdateQueue.items.clear();

    try {
        await db.threadItems.bulkPut(itemsToUpdate);
        // Update last update times for all processed items
        itemsToUpdate.forEach(item => {
            lastItemUpdateTime[item.id] = Date.now();
        });
    } catch (error) {
        console.error('Failed to batch update thread items:', error);
        // If bulk update fails, try individual updates to salvage what we can
        for (const item of itemsToUpdate) {
            try {
                await db.threadItems.put(item);
                lastItemUpdateTime[item.id] = Date.now();
            } catch (innerError) {
                console.error(`Failed to update item ${item.id}:`, innerError);
            }
        }
    }
};

// Queue an item for batch update
const queueThreadItemForUpdate = (threadItem: ThreadItem) => {
    // Always update the in-memory Map with the latest version
    batchUpdateQueue.items.set(threadItem.id, threadItem);

    // Schedule batch processing if not already scheduled
    if (!batchUpdateQueue.timeoutId) {
        batchUpdateQueue.timeoutId = setTimeout(() => {
            processBatchUpdate();
            batchUpdateQueue.timeoutId = null;
        }, BATCH_PROCESS_INTERVAL);
    }
};

// Add this near the top of your file after other imports
let dbWorker: SharedWorker | null = null;

// Extend Window interface to include notifyTabSync
declare global {
    interface Window {
        notifyTabSync?: (type: string, data: any) => void;
    }
}

// Function to initialize the shared worker
const initializeWorker = () => {
    if (typeof window === 'undefined') return;

    try {
        // Create a shared worker
        dbWorker = new SharedWorker(new URL('./db-sync.worker.ts', import.meta?.url), {
            type: 'module',
        });

        // Set up message handler
        dbWorker.port.onmessage = async event => {
            const message = event.data;

            if (!message || !message.type) return;

            // Handle different message types
            switch (message.type) {
                case 'connected':
                    console.log('Connected to SharedWorker');
                    break;

                case 'thread-update':
                    // Refresh threads list
                    const threads = await db.threads.toArray();
                    useChatStore.setState({
                        threads: threads.sort(
                            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                        ),
                    });
                    break;

                case 'thread-item-update':
                    // Refresh thread items if we're on the same thread
                    const currentThreadId = useChatStore.getState().currentThreadId;
                    if (message.data?.threadId === currentThreadId) {
                        await useChatStore.getState().loadThreadItems(message.data.threadId);
                    }
                    break;

                case 'thread-delete':
                    // Handle thread deletion
                    useChatStore.setState(state => {
                        const newState = { ...state };
                        newState.threads = state.threads.filter(
                            t => t.id !== message.data.threadId
                        );

                        // Update current thread if the deleted one was active
                        if (state.currentThreadId === message.data.threadId) {
                            newState.currentThreadId = newState.threads[0]?.id || null;
                            newState.currentThread = newState.threads[0] || null;
                        }

                        return newState;
                    });
                    break;

                case 'thread-item-delete':
                    // Handle thread item deletion
                    if (message.data?.threadId === useChatStore.getState().currentThreadId) {
                        useChatStore.setState(state => ({
                            threadItems: state.threadItems.filter(
                                item => item.id !== message.data.id
                            ),
                        }));
                    }
                    break;
            }
        };

        // Start the connection
        dbWorker.port.start();

        // Handle worker errors
        dbWorker.onerror = err => {
            console.error('SharedWorker error:', err);
        };
    } catch (error) {
        console.error('Failed to initialize SharedWorker:', error);
        // Fallback to localStorage method if SharedWorker isn't supported
        initializeTabSync();
    }
};

// Function to initialize tab synchronization using localStorage
const initializeTabSync = () => {
    if (typeof window === 'undefined') return;

    const SYNC_EVENT_KEY = 'chat-store-sync-event';
    const SYNC_DATA_KEY = 'chat-store-sync-data';

    // Listen for storage events from other tabs
    window.addEventListener('storage', event => {
        if (event.key !== SYNC_EVENT_KEY) return;

        try {
            const syncData = JSON.parse(localStorage.getItem(SYNC_DATA_KEY) || '{}');

            if (!syncData || !syncData.type) return;

            switch (syncData.type) {
                case 'thread-update':
                    // Refresh threads list
                    db.threads.toArray().then(threads => {
                        useChatStore.setState({
                            threads: threads.sort(
                                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                            ),
                        });
                    });
                    break;

                case 'thread-item-update':
                    // Refresh thread items if we're on the same thread
                    const currentThreadId = useChatStore.getState().currentThreadId;
                    if (syncData.data?.threadId === currentThreadId) {
                        useChatStore.getState().loadThreadItems(syncData.data.threadId);
                    }
                    break;

                case 'thread-delete':
                    // Handle thread deletion
                    useChatStore.setState(state => {
                        const newState = { ...state };
                        newState.threads = state.threads.filter(
                            t => t.id !== syncData.data.threadId
                        );

                        // Update current thread if the deleted one was active
                        if (state.currentThreadId === syncData.data.threadId) {
                            newState.currentThreadId = newState.threads[0]?.id || null;
                            newState.currentThread = newState.threads[0] || null;
                        }

                        return newState;
                    });
                    break;

                case 'thread-item-delete':
                    // Handle thread item deletion
                    if (syncData.data?.threadId === useChatStore.getState().currentThreadId) {
                        useChatStore.setState(state => ({
                            threadItems: state.threadItems.filter(
                                item => item.id !== syncData.data.id
                            ),
                        }));
                    }
                    break;
            }
        } catch (error) {
            console.error('Error processing sync data:', error);
        }
    });

    // Function to notify other tabs about a change
    const notifyOtherTabs = (type: string, data: any) => {
        try {
            // Store the sync data
            localStorage.setItem(
                SYNC_DATA_KEY,
                JSON.stringify({
                    type,
                    data,
                    timestamp: Date.now(),
                })
            );

            // Trigger the storage event in other tabs
            localStorage.setItem(SYNC_EVENT_KEY, Date.now().toString());
        } catch (error) {
            console.error('Error notifying other tabs:', error);
        }
    };

    // Replace the worker notification with localStorage notification
    window.notifyTabSync = notifyOtherTabs;
};

// Function to notify the worker about a change
const notifyWorker = (type: string, data: any) => {
    if (!dbWorker) {
        // Use localStorage fallback if worker isn't available
        if (typeof window !== 'undefined' && window.notifyTabSync) {
            window.notifyTabSync(type, data);
        }
        return;
    }

    try {
        dbWorker.port.postMessage({
            type,
            data,
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error('Error notifying worker:', error);
    }
};

// Create a debounced version of the notification function
const debouncedNotify = debounce(notifyWorker, 300);

export const useChatStore = create(
    immer<State & Actions>((set, get) => ({
        model: models[0],
        isGenerating: false,
        editor: undefined,
        context: '',
        threads: [],
        chatMode: ChatMode.GEMINI_2_FLASH,
        threadItems: [],
        useWebSearch: false,
        currentThreadId: null,
        currentThread: null,
        currentThreadItem: null,
        imageAttachment: { base64: undefined, file: undefined },
        messageGroups: [],
        abortController: null,
        isLoadingThreads: false,
        isLoadingThreadItems: false,
        currentSources: [],
        creditLimit: {
            remaining: undefined,
            maxLimit: undefined,
            reset: undefined,
            isAuthenticated: false,
            isFetched: false,
        },
        showSuggestions: true,

        setImageAttachment: (imageAttachment: { base64?: string; file?: File }) => {
            set(state => {
                state.imageAttachment = imageAttachment;
            });
        },

        clearImageAttachment: () => {
            set(state => {
                state.imageAttachment = { base64: undefined, file: undefined };
            });
        },

        setShowSuggestions: (showSuggestions: boolean) => {
            localStorage.setItem(CONFIG_KEY, JSON.stringify({ showSuggestions }));
            set(state => {
                state.showSuggestions = showSuggestions;
            });
        },

        setUseWebSearch: (useWebSearch: boolean) => {
            const existingConfig = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
            localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...existingConfig, useWebSearch }));
            set(state => {
                state.useWebSearch = useWebSearch;
            });
        },

        setChatMode: (chatMode: ChatMode) => {
            localStorage.setItem(CONFIG_KEY, JSON.stringify({ chatMode }));
            set(state => {
                state.chatMode = chatMode;
            });
        },

        pinThread: async (threadId: string) => {
            await db.threads.update(threadId, { pinned: true, pinnedAt: new Date() });
            set(state => {
                state.threads = state.threads.map(thread =>
                    thread.id === threadId
                        ? { ...thread, pinned: true, pinnedAt: new Date() }
                        : thread
                );
            });
        },

        unpinThread: async (threadId: string) => {
            await db.threads.update(threadId, { pinned: false, pinnedAt: new Date() });
            set(state => {
                state.threads = state.threads.map(thread =>
                    thread.id === threadId
                        ? { ...thread, pinned: false, pinnedAt: new Date() }
                        : thread
                );
            });
        },

        fetchRemainingCredits: async () => {
            try {
                const response = await fetch('/api/messages/remaining');
                if (!response.ok) throw new Error('Failed to fetch credit info');

                const data = await response.json();
                set({
                    creditLimit: {
                        ...data,
                        isFetched: true,
                    },
                });
            } catch (error) {
                console.error('Error fetching remaining credits:', error);
            }
        },

        getPinnedThreads: async () => {
            const threads = await db.threads.where('pinned').equals('true').toArray();
            return threads.sort((a, b) => b.pinnedAt.getTime() - a.pinnedAt.getTime());
        },

        removeFollowupThreadItems: async (threadItemId: string) => {
            const threadItem = await db.threadItems.get(threadItemId);
            if (!threadItem) return;
            const threadItems = await db.threadItems
                .where('createdAt')
                .above(threadItem.createdAt)
                .and(item => item.threadId === threadItem.threadId)
                .toArray();
            for (const threadItem of threadItems) {
                await db.threadItems.delete(threadItem.id);
            }
            set(state => {
                state.threadItems = state.threadItems.filter(
                    t => t.createdAt <= threadItem.createdAt || t.threadId !== threadItem.threadId
                );
            });

            // Notify other tabs
            debouncedNotify('thread-item-delete', {
                threadId: threadItem.threadId,
                id: threadItemId,
                isFollowupRemoval: true,
            });
        },

        getThreadItems: async (threadId: string) => {
            const threadItems = await db.threadItems.where('threadId').equals(threadId).toArray();
            return threadItems;
        },

        setCurrentSources: (sources: string[]) => {
            set(state => {
                state.currentSources = sources;
            });
        },

        setCurrentThreadItem: threadItem =>
            set(state => {
                state.currentThreadItem = threadItem;
            }),

        setEditor: editor =>
            set(state => {
                state.editor = editor;
            }),

        setContext: context =>
            set(state => {
                state.context = context;
            }),

        setIsGenerating: isGenerating => {
            useAppStore.getState().dismissSideDrawer();
            set(state => {
                state.isGenerating = isGenerating;
            });
        },

        stopGeneration: () => {
            set(state => {
                state.isGenerating = false;
                state.abortController?.abort();
            });
        },

        setAbortController: abortController =>
            set(state => {
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

        getThread: async (threadId: string) => {
            const thread = await db.threads.get(threadId);
            return thread || null;
        },

        createThread: async (optimisticId: string, thread?: Pick<Thread, 'title'>) => {
            const threadId = optimisticId || nanoid();
            const newThread = {
                id: threadId,
                title: thread?.title || 'New Thread',
                updatedAt: new Date(),
                createdAt: new Date(),
                pinned: false,
                pinnedAt: new Date(),
            };
            await db.threads.add(newThread);
            set(state => {
                state.threads.push(newThread);
                state.currentThreadId = newThread.id;
                state.currentThread = newThread;
            });

            // Notify other tabs through the worker
            debouncedNotify('thread-update', { threadId });

            return newThread;
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

                // Notify other tabs about the update
                debouncedNotify('thread-update', { threadId: thread.id });
            } catch (error) {
                console.error('Failed to update thread in database:', error);
            }
        },

        createThreadItem: async threadItem => {
            const threadId = get().currentThreadId;
            if (!threadId) return;
            try {
                await db.threadItems.put(threadItem);
                set(state => {
                    if (state.threadItems.find(t => t.id === threadItem.id)) {
                        state.threadItems = state.threadItems.map(t =>
                            t.id === threadItem.id ? threadItem : t
                        );
                    } else {
                        state.threadItems.push({ ...threadItem, threadId });
                    }
                });

                // Notify other tabs
                debouncedNotify('thread-item-update', {
                    threadId,
                    id: threadItem.id,
                });
            } catch (error) {
                console.error('Failed to create thread item:', error);
                // Handle error appropriately
            }
        },

        updateThreadItem: async (threadId, threadItem) => {
            if (!threadItem.id) return;
            if (!threadId) return;

            try {
                console.log('updateThreadItem', threadItem);

                // Fetch the existing item
                let existingItem: ThreadItem | undefined;
                try {
                    existingItem = await db.threadItems.get(threadItem.id);
                } catch (error) {
                    console.warn(`Couldn't fetch existing item ${threadItem.id}:`, error);
                }

                // Create or update the item
                const updatedItem = existingItem
                    ? { ...existingItem, ...threadItem, threadId, updatedAt: new Date() }
                    : ({
                          id: threadItem.id,
                          threadId,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                          ...threadItem,
                      } as ThreadItem);

                // Update UI state immediately
                set(state => {
                    const index = state.threadItems.findIndex(t => t.id === threadItem.id);
                    if (index !== -1) {
                        state.threadItems[index] = updatedItem;
                    } else {
                        state.threadItems.push(updatedItem);
                    }
                });

                // // Determine if this is a critical update that should bypass throttling
                // const isCriticalUpdate =
                //     !existingItem || // New items
                //     threadItem.status === 'COMPLETED' || // Final updates
                //     threadItem.status === 'ERROR' || // Error states
                //     threadItem.status === 'ABORTED' || // Aborted states
                //     threadItem.error !== undefined; // Any error information

                // // Always persist final updates - this fixes the issue with missing updates at stream completion
                // if (
                //     threadItem.persistToDB === true ||
                //     isCriticalUpdate ||
                //     timeSinceLastUpdate > DB_UPDATE_THROTTLE
                // ) {
                //     // For critical updates or if enough time has passed, queue for immediate update
                //     queueThreadItemForUpdate(updatedItem);

                queueThreadItemForUpdate(updatedItem);

                // Notify other tabs about the update
                debouncedNotify('thread-item-update', {
                    threadId,
                    id: threadItem.id,
                });

                // if (isCriticalUpdate) {
                //     lastItemUpdateTime[threadItem.id] = now;
                // }
                // }
                // Non-critical updates that are too soon after the last update
                // won't be persisted yet, but will be in the UI state
            } catch (error) {
                console.error('Error in updateThreadItem:', error);

                // Safety fallback - try to persist directly in case of errors in the main logic
                try {
                    const fallbackItem = {
                        id: threadItem.id,
                        threadId,
                        query: threadItem.query || '',
                        mode: threadItem.mode || ChatMode.GEMINI_2_FLASH,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        ...threadItem,
                        error: threadItem.error || `Something went wrong`,
                    };
                    await db.threadItems.put(fallbackItem);
                } catch (fallbackError) {
                    console.error(
                        'Critical: Failed even fallback thread item update:',
                        fallbackError
                    );
                }
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
            const threadId = get().currentThreadId;
            if (!threadId) return;

            await db.threadItems.delete(threadItemId);
            set(state => {
                state.threadItems = state.threadItems.filter(
                    (t: ThreadItem) => t.id !== threadItemId
                );
            });

            // Notify other tabs
            debouncedNotify('thread-item-delete', { id: threadItemId, threadId });

            // Check if there are any thread items left for this thread
            const remainingItems = await db.threadItems.where('threadId').equals(threadId).count();

            // If no items remain, delete the thread and redirect
            if (remainingItems === 0) {
                await db.threads.delete(threadId);
                set(state => {
                    state.threads = state.threads.filter((t: Thread) => t.id !== threadId);
                    state.currentThreadId = state.threads[0]?.id;
                    state.currentThread = state.threads[0] || null;
                });

                // Redirect to /chat page
                if (typeof window !== 'undefined') {
                    window.location.href = '/chat';
                }
            }
        },

        deleteThread: async threadId => {
            await db.threads.delete(threadId);
            await db.threadItems.where('threadId').equals(threadId).delete();
            set(state => {
                state.threads = state.threads.filter((t: Thread) => t.id !== threadId);
                state.currentThreadId = state.threads[0]?.id;
                state.currentThread = state.threads[0] || null;
            });

            // Notify other tabs
            debouncedNotify('thread-delete', { threadId });
        },

        getPreviousThreadItems: threadId => {
            const state = get();

            const allThreadItems = state.threadItems
                .filter(item => item.threadId === threadId)
                .sort((a, b) => {
                    return a.createdAt.getTime() - b.createdAt.getTime();
                });

            if (allThreadItems.length > 1) {
                return allThreadItems.slice(0, -1);
            }

            return [];
        },

        getCurrentThreadItem: () => {
            const state = get();

            const allThreadItems = state.threadItems
                .filter(item => item.threadId === state.currentThreadId)
                .sort((a, b) => {
                    return a.createdAt.getTime() - b.createdAt.getTime();
                });
            return allThreadItems[allThreadItems.length - 1] || null;
        },

        getCurrentThread: () => {
            const state = get();
            return state.threads.find(t => t.id === state.currentThreadId) || null;
        },
    }))
);

if (typeof window !== 'undefined') {
    // Initialize store with data from IndexedDB
    loadInitialData().then(
        ({ threads, currentThreadId, chatMode, useWebSearch, showSuggestions }) => {
            useChatStore.setState({
                threads,
                currentThreadId,
                currentThread: threads.find(t => t.id === currentThreadId) || threads?.[0],
                chatMode,
                useWebSearch,
                showSuggestions,
            });

            // Initialize the shared worker for tab synchronization
            if ('SharedWorker' in window) {
                initializeWorker();
            } else {
                // Fallback to localStorage method
                initializeTabSync();
            }
        }
    );
}
