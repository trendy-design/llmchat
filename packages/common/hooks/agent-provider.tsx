import { useAuth, useUser } from '@clerk/nextjs';
import { useWorkflowWorker } from '@repo/ai/worker';
import { nanoid } from 'nanoid';
import { useParams, useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useApiKeysStore, useAppStore, useChatStore, useMcpToolsStore } from '../store';
import { ThreadItem } from '../store/chat.store';

type AgentContextType = {
    runAgent: (body: any) => Promise<void>;
    handleSubmit: ({
        formData,
        newThreadId,
        existingThreadItemId,
        newChatMode,
        messages,
        useWebSearch,
        showSuggestions,
    }: {
        formData: FormData;
        newThreadId?: string;
        existingThreadItemId?: string;
        newChatMode?: string;
        messages?: ThreadItem[];
        useWebSearch?: boolean;
        showSuggestions?: boolean;
    }) => Promise<void>;
    updateContext: (threadId: string, data: any) => void;
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider = ({ children }: { children: ReactNode }) => {
    const { threadId: currentThreadId } = useParams();
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const updateThreadItem = useChatStore(state => state.updateThreadItem);
    const setIsGenerating = useChatStore(state => state.setIsGenerating);
    const setAbortController = useChatStore(state => state.setAbortController);
    const createThreadItem = useChatStore(state => state.createThreadItem);
    const setCurrentThreadItem = useChatStore(state => state.setCurrentThreadItem);
    const setCurrentSources = useChatStore(state => state.setCurrentSources);
    const updateThread = useChatStore(state => state.updateThread);
    const chatMode = useChatStore(state => state.chatMode);
    const getSelectedMCP = useMcpToolsStore(state => state.getSelectedMCP);
    const apiKeys = useApiKeysStore(state => state.getAllKeys);
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);
    const fetchRemainingCredits = useChatStore(state => state.fetchRemainingCredits);
    const setShowSignInModal = useAppStore(state => state.setShowSignInModal);

    useEffect(() => {
        fetchRemainingCredits();
    }, [user?.id]);

    // Single shared map for both methods
    const threadItemMap = new Map<string, ThreadItem>();

    // Shared function to handle updates
    const handleThreadItemUpdate = (
        threadId: string,
        threadItemId: string,
        eventType: string,
        eventData: any,
        parentThreadItemId?: string,
        shouldPersistToDB: boolean = true
    ) => {
        const threadItemState = threadItemMap.get(threadItemId);

        // Update the in-memory state
        threadItemMap.set(threadItemId, {
            ...threadItemState,
            [eventType]:
                eventType === 'answer'
                    ? {
                          ...eventData['answer'],
                          text: (threadItemState?.answer?.text || '') + eventData['answer'].text,
                      }
                    : eventData[eventType],
            query: eventData?.query || threadItemState?.query || '',
            mode: eventData?.mode || threadItemState?.mode,
            threadId,
            parentId: parentThreadItemId || threadItemState?.parentId,
            id: threadItemId,
            createdAt: threadItemState?.createdAt || new Date(),
            updatedAt: new Date(),
        });

        // Update the thread item in the store
        updateThreadItem(threadId, {
            ...threadItemMap.get(threadItemId),
            persistToDB: shouldPersistToDB,
        });
    };

    const router = useRouter();
    const { startWorkflow, abortWorkflow } = useWorkflowWorker(data => {
        console.log('data', data);

        if (data?.threadId && data?.threadItemId) {
            if (
                data.event &&
                [
                    'steps',
                    'sources',
                    'answer',
                    'error',
                    'status',
                    'suggestions',
                    'toolCalls',
                    'toolResults',
                ].includes(data.event)
            ) {
                handleThreadItemUpdate(
                    data.threadId,
                    data.threadItemId,
                    data.event,
                    data,
                    data.parentThreadItemId
                );
            }
        }

        if (data.type === 'done') {
            setIsGenerating(false);
            setTimeout(() => {
                fetchRemainingCredits();
            }, 1000);

            if (data?.threadItemId) {
                threadItemMap.delete(data.threadItemId);
            }
        }
    });

    const runAgent = async (body: any) => {
        const abortController = new AbortController();
        setAbortController(abortController);
        if (!abortController) {
            return;
        }
        setIsGenerating(true);

        abortController.signal.addEventListener('abort', () => {
            console.log('abortController aborted');
            setIsGenerating(false);
            updateThreadItem(body.threadId as string, {
                id: body.threadItemId as string,
                status: 'ABORTED',
            });
        });

        const response = await fetch(`/api/completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'include',
            cache: 'no-store',
            signal: abortController?.signal,
        });

        if (!response.ok) {
            const errorText = await response.text();
            setIsGenerating(false);

            let errorMessage = errorText;

            updateThreadItem(body.threadId as string, {
                id: body.threadItemId as string,
                status: 'ERROR',
                error: errorMessage,
            });
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
            throw new Error('No response body received');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
            let lastDbUpdate = Date.now();
            const DB_UPDATE_INTERVAL = 1000;

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                try {
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    let currentEvent = '';
                    let jsonData = '';

                    for (const line of lines) {
                        if (line.startsWith('event: ')) {
                            currentEvent = line.slice(7);
                        } else if (line.startsWith('data: ')) {
                            jsonData = line.slice(6);

                            try {
                                const data = JSON.parse(jsonData);
                                console.log('event:', currentEvent, 'data:', data);

                                if (
                                    [
                                        'steps',
                                        'sources',
                                        'answer',
                                        'error',
                                        'status',
                                        'suggestions',
                                        'toolCalls',
                                        'toolResults',
                                    ].includes(currentEvent) &&
                                    data?.threadId &&
                                    data?.threadItemId
                                ) {
                                    const shouldPersistToDB =
                                        Date.now() - lastDbUpdate >= DB_UPDATE_INTERVAL;

                                    handleThreadItemUpdate(
                                        data.threadId,
                                        data.threadItemId,
                                        currentEvent,
                                        data,
                                        data.parentThreadItemId,
                                        shouldPersistToDB
                                    );

                                    if (shouldPersistToDB) {
                                        lastDbUpdate = Date.now();
                                    }
                                } else if (currentEvent === 'done' && data.type === 'done') {
                                    setIsGenerating(false);
                                    setTimeout(() => {
                                        fetchRemainingCredits();
                                    }, 1000);

                                    if (data.threadItemId) {
                                        threadItemMap.delete(data.threadItemId);
                                    }

                                    if (data.status === 'error') {
                                        console.error('Stream error:', data.error);
                                    }
                                }
                            } catch (parseError) {
                                console.warn('Parse error:', parseError);
                                console.warn('Malformed data:', jsonData);
                                continue;
                            }
                        }
                    }
                } catch (chunkError) {
                    // Skip problematic chunk and continue with the next one
                    console.warn('Skipping problematic chunk');
                    continue;
                }
            }
        } catch (streamError) {
            console.error('Fatal stream error:', streamError);
            updateThreadItem(body.threadId as string, {
                id: body.threadItemId as string,
                status: 'ERROR',
                error: 'Stream connection error: ' + (streamError as Error).message,
            });
        }
    };

    const handleSubmit = async ({
        formData,
        newThreadId,
        existingThreadItemId,
        newChatMode,
        messages,
        useWebSearch,
        showSuggestions,
    }: {
        formData: FormData;
        newThreadId?: string;
        existingThreadItemId?: string;
        newChatMode?: string;
        messages?: ThreadItem[];
        useWebSearch?: boolean;
        showSuggestions?: boolean;
    }) => {
        if (!isSignedIn) {
            return;
        }
        let threadId = currentThreadId?.toString() || newThreadId;

        if (threadId) {
            console.log('updating thread');
            updateThread({
                id: threadId,
                title: formData.get('query') as string,
            });
        }

        if (!threadId) {
            return;
        }

        const optimisticAiThreadItemId = existingThreadItemId ?? nanoid();

        const query = formData.get('query') as string;
        const imageAttachment = formData.get('imageAttachment') as string;

        const aiThreadItem: ThreadItem = {
            id: optimisticAiThreadItemId,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'QUEUED' as const,
            threadId,
            query: formData.get('query') as string,
            imageAttachment: formData.get('imageAttachment') as string,
            mode: newChatMode ?? (chatMode as any),
        };

        createThreadItem(aiThreadItem);
        setCurrentThreadItem(aiThreadItem);
        setIsGenerating(true);
        setCurrentSources([]);

        const coreMessages = [
            ...(messages?.flatMap(item => [
                {
                    role: 'user' as const,
                    content: !!item?.imageAttachment
                        ? [
                              {
                                  type: 'text' as const,
                                  text: item?.query || '',
                              },
                              {
                                  type: 'image' as const,
                                  image: item?.imageAttachment,
                              },
                          ]
                        : item.query || '',
                },
                {
                    role: 'assistant' as const,
                    content: item.answer?.text || '',
                },
            ]) || []),
            {
                role: 'user' as const,
                content: !!imageAttachment
                    ? [
                          {
                              type: 'text' as const,
                              text: query || '',
                          },
                          {
                              type: 'image' as const,
                              image: imageAttachment,
                          },
                      ]
                    : query || '',
            },
        ];

        console.log('coreMessages', coreMessages);

        if (hasApiKeyForChatMode(newChatMode ?? (chatMode as any))) {
            const abortController = new AbortController();
            setAbortController(abortController);
            if (!abortController) {
                return;
            }
            console.log('local-web-agent');
            setIsGenerating(true);

            abortController.signal.addEventListener('abort', () => {
                console.log('abortController aborted');
                setIsGenerating(false);
                abortWorkflow();
                updateThreadItem(threadId, {
                    id: optimisticAiThreadItemId,
                    status: 'ABORTED',
                });
            });

            startWorkflow({
                mode: newChatMode ?? (chatMode as any),
                question: formData.get('query') as string,
                threadId,
                messages: coreMessages,
                mcpConfig: getSelectedMCP(),
                threadItemId: optimisticAiThreadItemId,
                parentThreadItemId: '',
                apiKeys: apiKeys(),
            });
        } else {
            console.log('remote-web-agent');
            runAgent({
                mode: newChatMode ?? (chatMode as any),
                prompt: formData.get('query') as string,
                threadId,
                messages: coreMessages,
                mcpConfig: getSelectedMCP(),
                threadItemId: optimisticAiThreadItemId,
                parentThreadItemId: '',
                webSearch: useWebSearch,
                showSuggestions: true,
            });
        }
    };

    const updateContext = (threadId: string, data: any) => {
        console.log('updateContext', data);
        updateThreadItem(threadId, {
            id: data.threadItemId,
            parentId: data.parentThreadItemId,
            threadId: data.threadId,
            metadata: data.context,
        });
    };

    const value = {
        runAgent,
        handleSubmit,
        updateContext,
    };

    return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
};

export const useAgentStream = (): AgentContextType => {
    const context = useContext(AgentContext);
    if (context === undefined) {
        throw new Error('useAgentStream must be used within an AgentProvider');
    }
    return context;
};
