import { useAuth, useUser } from '@clerk/nextjs';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useWorkflowWorker } from '@repo/ai/worker';
import { ChatMode, ChatModeConfig } from '@repo/shared/config';
import { ThreadItem, WorkflowEventSchema } from '@repo/shared/types';
import { buildCoreMessagesFromThreadItems, plausible } from '@repo/shared/utils';
import { nanoid } from 'nanoid';
import { useParams, useRouter } from 'next/navigation';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import { useApiKeysStore, useChatStore, useMcpToolsStore } from '../store';

export type submitHandlerArgs = {
    formData: FormData;
    newThreadId?: string;
    existingThreadItemId?: string;
    newChatMode?: string;
    messages?: ThreadItem[];
    useWebSearch?: boolean;
    showSuggestions?: boolean;
    breakpointId?: string;
    breakpointData?: any;
};

// ... existing code ...
export type AgentContextType = {
    executeAgent: (payload: any) => Promise<void>;
    handleSubmit: (args: submitHandlerArgs) => Promise<void>;
    updateAgentContext: (threadId: string, data: any) => void;
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

const AGENT_EVENT_TYPES = [
    'steps',
    'sources',
    'answer',
    'error',
    'status',
    'suggestions',
    'toolCalls',
    'toolResults',
    'object',
    'breakpoint',
];

export const AgentProvider = ({ children }: { children: ReactNode }) => {
    const { threadId: currentThreadId } = useParams();
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const {
        updateThreadItem,
        setIsGenerating,
        setAbortController,
        createThreadItem,
        setCurrentThreadItem,
        setCurrentSources,
        updateThread,
        chatMode,
        fetchRemainingCredits,
        customInstructions,
        getCurrentThreadItem,
    } = useChatStore(state => ({
        updateThreadItem: state.updateThreadItem,
        setIsGenerating: state.setIsGenerating,
        setAbortController: state.setAbortController,
        createThreadItem: state.createThreadItem,
        setCurrentThreadItem: state.setCurrentThreadItem,
        setCurrentSources: state.setCurrentSources,
        updateThread: state.updateThread,
        chatMode: state.chatMode,
        fetchRemainingCredits: state.fetchRemainingCredits,
        customInstructions: state.customInstructions,
        getCurrentThreadItem: state.getCurrentThreadItem,
    }));
    const { push } = useRouter();

    const getSelectedMCPConfig = useMcpToolsStore(state => state.getSelectedMCP);
    const getApiKeys = useApiKeysStore(state => state.getAllKeys);
    const hasApiKeyForMode = useApiKeysStore(state => state.hasApiKeyForChatMode);
    const { getToken } = useAuth();

    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        fetchRemainingCredits();
    }, [user?.id, fetchRemainingCredits]);

    const updateThreadItemCache = useCallback(
        (
            threadId: string,
            threadItemId: string,
            eventType: string,
            eventData: WorkflowEventSchema & { query: string; mode: ChatMode },
            parentThreadItemId?: string
        ) => {
            const previousItem = getCurrentThreadItem() || ({} as ThreadItem);

            let mergedItem: ThreadItem = {
                ...previousItem,
                query: eventData?.query || previousItem.query || '',
                mode: eventData?.mode || previousItem.mode,
                threadId,
                parentId: parentThreadItemId || previousItem.parentId,
                id: threadItemId,
                object: eventData?.object || previousItem.object,
                createdAt: previousItem.createdAt || new Date(),
                updatedAt: new Date(),
                breakpoint: eventData?.breakpoint || previousItem.breakpoint,
            };

            if (eventType === 'answer' && eventData.answer && eventData.answer.message) {
                console.log(
                    'answer event',
                    eventData.answer.message,
                    mergedItem.answer?.messages,
                    previousItem
                );

                const existingMessages = mergedItem?.answer?.messages ?? [];
                const newMessage = existingMessages.find(
                    m =>
                        m.type === eventData.answer.message?.type &&
                        m.id === eventData.answer.message?.id
                );

                const updatedMessages = existingMessages.map(m => {
                    if (
                        m.type === eventData.answer.message?.type &&
                        m.id === eventData.answer.message?.id &&
                        eventData.answer.message.type === 'text' &&
                        m.type === 'text'
                    ) {
                        if (eventData.answer.message.isFullText) {
                            return eventData.answer.message;
                        }
                        return {
                            ...m,
                            text: (m.text || '') + (eventData.answer.message.text || ''),
                        };
                    }

                    if (
                        m.type === eventData.answer.message?.type &&
                        m.id === eventData.answer.message?.id &&
                        eventData.answer.message.type === 'tool-call' &&
                        m.type === 'tool-call'
                    ) {
                        return eventData.answer.message;
                    }

                    if (
                        m.type === eventData.answer.message?.type &&
                        m.id === eventData.answer.message?.id &&
                        eventData.answer.message.type === 'tool-result' &&
                        m.type === 'tool-result'
                    ) {
                        return eventData.answer.message;
                    }

                    return m;
                });

                console.log('mergedItem u new', updatedMessages, newMessage);

                mergedItem = {
                    ...mergedItem,
                    answer: {
                        ...mergedItem.answer,
                        text: '', // deprecated
                        isChunk: false, // deprecated
                        messages: [
                            ...updatedMessages,
                            ...(newMessage ? [] : [eventData.answer.message]),
                        ],
                    },
                };
            } else if (eventType in eventData) {
                mergedItem = {
                    ...mergedItem,
                    [eventType]: eventData[eventType as keyof WorkflowEventSchema],
                };
            }

            console.log('mergedItem', mergedItem);

            updateThreadItem(threadId, { ...mergedItem, persistToDB: true });
        },
        [updateThreadItem]
    );

    const { startWorkflow, abortWorkflow } = useWorkflowWorker(
        useCallback(
            (event: any) => {
                if (
                    event?.threadId &&
                    event?.threadItemId &&
                    event.event &&
                    AGENT_EVENT_TYPES.includes(event.event)
                ) {
                    updateThreadItemCache(
                        event.threadId,
                        event.threadItemId,
                        event.event,
                        event,
                        event.parentThreadItemId
                    );
                }

                if (event.type === 'done') {
                    setIsGenerating(false);
                    setTimeout(fetchRemainingCredits, 1000);
                }
            },
            [updateThreadItemCache, setIsGenerating, fetchRemainingCredits]
        )
    );

    const executeAgent = useCallback(
        async (payload: any) => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const abortController = new AbortController();
            abortControllerRef.current = abortController;
            setIsGenerating(true);

            abortController.signal.addEventListener('abort', () => {
                setIsGenerating(false);
                updateThreadItem(payload.threadId, {
                    id: payload.threadItemId,
                    status: 'ABORTED',
                    persistToDB: true,
                });
            });

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                throw new Error('NEXT_PUBLIC_API_URL is not set');
            }

            try {
                await fetchEventSource(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${await getToken()}`,
                    },
                    body: JSON.stringify(payload),
                    credentials: 'include',
                    signal: abortController.signal,
                    onopen: async res => {
                        if (!res.ok) {
                            throw new Error(`HTTP error! status: ${res.status}`);
                        }
                    },
                    onmessage(msg) {
                        const { event, data } = msg;
                        if (!event || !data) return;
                        try {
                            const parsedData = JSON.parse(data);
                            if (
                                AGENT_EVENT_TYPES.includes(event) &&
                                parsedData?.threadId &&
                                parsedData?.threadItemId
                            ) {
                                setCurrentThreadItem(parsedData.threadItemId);
                                updateThreadItemCache(
                                    parsedData.threadId,
                                    parsedData.threadItemId,
                                    event,
                                    parsedData,
                                    parsedData.parentThreadItemId
                                );
                            } else if (event === 'done' && parsedData.type === 'done') {
                                setIsGenerating(false);
                                setTimeout(fetchRemainingCredits, 1000);
                            }
                        } catch (err) {}
                    },
                    onerror(err) {
                        setIsGenerating(false);
                        updateThreadItem(payload.threadId, {
                            id: payload.threadItemId,
                            status: 'ERROR',
                            error: 'Something went wrong. Please try again.',
                        });
                        throw err;
                    },
                    onclose() {
                        console.log('onclose');
                        setIsGenerating(false);
                    },
                    keepalive: true,
                    priority: 'high',
                    openWhenHidden: true,
                });
            } catch (err: any) {
                setIsGenerating(false);
                updateThreadItem(payload.threadId, {
                    id: payload.threadItemId,
                    status: 'ERROR',
                    error: err.message || 'Something went wrong. Please try again.',
                });
            }
        },
        [
            setIsGenerating,
            updateThreadItem,
            updateThreadItemCache,
            fetchRemainingCredits,
            AGENT_EVENT_TYPES,
            getToken,
        ]
    );

    const handleSubmit = useCallback(
        async ({
            formData,
            newThreadId,
            existingThreadItemId,
            newChatMode,
            messages,
            useWebSearch,
            showSuggestions,
            breakpointId,
            breakpointData,
        }: submitHandlerArgs) => {
            const mode = (newChatMode || chatMode) as ChatMode;
            if (
                !isSignedIn &&
                ChatModeConfig[mode as keyof typeof ChatModeConfig]?.isAuthRequired
            ) {
                push('/sign-in');
                return;
            }

            const threadId = currentThreadId?.toString() || newThreadId;
            if (!threadId) return;

            updateThread({ id: threadId, title: formData.get('query') as string });

            const aiThreadItemId = existingThreadItemId || nanoid();
            const query = formData.get('query') as string;
            const imageAttachment = formData.get('imageAttachment') as string;

            const aiThreadItem: ThreadItem = {
                id: aiThreadItemId,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'QUEUED',
                error: undefined,
                threadId,
                query,
                imageAttachment,
                mode,
                schemaVersion: 1,
            };

            createThreadItem(aiThreadItem);
            setCurrentThreadItem(aiThreadItem.id);
            setIsGenerating(true);
            setCurrentSources([]);

            plausible.trackEvent('send_message', {
                props: {
                    mode,
                },
            });

            const coreMessages = buildCoreMessagesFromThreadItems({
                messages: messages || [],
                query,
                imageAttachment,
            });

            if (hasApiKeyForMode(mode)) {
                const abortController = new AbortController();
                setAbortController(abortController);
                setIsGenerating(true);

                abortController.signal.addEventListener('abort', () => {
                    setIsGenerating(false);
                    abortWorkflow();
                    updateThreadItem(threadId, { id: aiThreadItemId, status: 'ABORTED' });
                });

                startWorkflow({
                    mode,
                    question: query,
                    threadId,
                    messages: coreMessages,
                    mcpConfig: getSelectedMCPConfig(),
                    threadItemId: aiThreadItemId,
                    parentThreadItemId: '',
                    customInstructions,
                    apiKeys: getApiKeys(),
                });
            } else {
                executeAgent({
                    mode: newChatMode || chatMode,
                    prompt: query,
                    threadId,
                    messages: coreMessages,
                    mcpConfig: getSelectedMCPConfig(),
                    threadItemId: aiThreadItemId,
                    customInstructions,
                    parentThreadItemId: '',
                    webSearch: useWebSearch,
                    showSuggestions: showSuggestions ?? true,
                    breakpointId,
                    breakpointData,
                });
            }
        },
        [
            isSignedIn,
            currentThreadId,
            chatMode,
            updateThread,
            createThreadItem,
            setCurrentThreadItem,
            setIsGenerating,
            setCurrentSources,
            abortWorkflow,
            startWorkflow,
            customInstructions,
            getSelectedMCPConfig,
            getApiKeys,
            hasApiKeyForMode,
            updateThreadItem,
            executeAgent,
        ]
    );

    const updateAgentContext = useCallback(
        (threadId: string, data: any) => {
            updateThreadItem(threadId, {
                id: data.threadItemId,
                parentId: data.parentThreadItemId,
                threadId: data.threadId,
                metadata: data.context,
            });
        },
        [updateThreadItem]
    );

    const contextValue = useMemo(
        () => ({
            executeAgent,
            handleSubmit,
            updateAgentContext,
        }),
        [executeAgent, handleSubmit, updateAgentContext]
    );

    return <AgentContext.Provider value={contextValue}>{children}</AgentContext.Provider>;
};

export const useAgentStream = (): AgentContextType => {
    const context = useContext(AgentContext);
    if (!context) {
        throw new Error('useAgentStream must be used within an AgentProvider');
    }
    return context;
};
// ... existing code ...
