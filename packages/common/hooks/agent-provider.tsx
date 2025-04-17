import { useAuth, useUser } from '@clerk/nextjs';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useWorkflowWorker } from '@repo/ai/worker';
import { ChatMode, ChatModeConfig } from '@repo/shared/config';
import { ThreadItem } from '@repo/shared/types';
import { buildCoreMessagesFromThreadItems, plausible } from '@repo/shared/utils';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import { useParams, useRouter } from 'next/navigation';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo } from 'react';
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
    }));
    const { push } = useRouter();

    const getSelectedMCPConfig = useMcpToolsStore(state => state.getSelectedMCP);
    const getApiKeys = useApiKeysStore(state => state.getAllKeys);
    const hasApiKeyForMode = useApiKeysStore(state => state.hasApiKeyForChatMode);

    useEffect(() => {
        fetchRemainingCredits();
    }, [user?.id, fetchRemainingCredits]);

    const threadItemCache = useMemo(() => new Map<string, ThreadItem>(), []);

    const updateThreadItemCache = useCallback(
        (
            threadId: string,
            threadItemId: string,
            eventType: string,
            eventData: ThreadItem,
            parentThreadItemId?: string
        ) => {
            const previousItem = threadItemCache.get(threadItemId) || ({} as ThreadItem);

            const mergedItem = produce(previousItem, draft => {
                draft.query = eventData?.query || draft.query || '';
                draft.mode = eventData?.mode || draft.mode;
                draft.threadId = threadId;
                draft.parentId = parentThreadItemId || draft.parentId;
                draft.id = threadItemId;
                draft.object = eventData?.object || draft.object;
                draft.createdAt = draft.createdAt || new Date();
                draft.updatedAt = new Date();
                draft.breakpoint = eventData?.breakpoint || draft.breakpoint;

                if (eventType === 'answer' && eventData.answer) {
                    draft.answer = draft.answer;
                    draft.answer = {
                        ...draft.answer,
                        ...eventData.answer,
                        text: (draft.answer?.text || '') + (eventData.answer.text || ''),
                        messages: [
                            ...(draft.answer?.messages?.filter(
                                m =>
                                    !eventData.answer?.messages?.some(
                                        em => em.id === m.id && em.type === m.type
                                    )
                            ) || []),
                            ...(eventData.answer?.messages?.map(newMessage => {
                                const existingMessage = draft.answer?.messages?.find(
                                    m => m.id === newMessage.id && m.type === newMessage.type
                                );
                                if (
                                    existingMessage &&
                                    newMessage.type === 'text' &&
                                    existingMessage.type === 'text'
                                ) {
                                    return {
                                        ...newMessage,
                                        text:
                                            (existingMessage.text || '') + (newMessage.text || ''),
                                    };
                                }
                                return newMessage;
                            }) || []),
                        ],
                    };
                } else if (eventType in eventData) {
                    // @ts-ignore
                    draft[eventType] = eventData[eventType as keyof ThreadItem];
                }
            });

            threadItemCache.set(threadItemId, mergedItem);
            updateThreadItem(threadId, { ...mergedItem, persistToDB: true });
        },
        [threadItemCache, updateThreadItem]
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
                    if (event?.threadItemId) {
                        threadItemCache.delete(event.threadItemId);
                    }
                }
            },
            [updateThreadItemCache, setIsGenerating, fetchRemainingCredits, threadItemCache]
        )
    );

    const executeAgent = useCallback(
        async (payload: any) => {
            const abortController = new AbortController();
            setAbortController(abortController);
            setIsGenerating(true);

            abortController.signal.addEventListener('abort', () => {
                setIsGenerating(false);
                updateThreadItem(payload.threadId, {
                    id: payload.threadItemId,
                    status: 'ABORTED',
                    persistToDB: true,
                });
            });

            try {
                await fetchEventSource('/api/completion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                                if (parsedData.threadItemId) {
                                    threadItemCache.delete(parsedData.threadItemId);
                                }
                            }
                        } catch (err) {}
                    },
                    onerror() {
                        setIsGenerating(false);
                        updateThreadItem(payload.threadId, {
                            id: payload.threadItemId,
                            status: 'ERROR',
                            error: 'Something went wrong. Please try again.',
                        });
                    },
                    onclose() {
                        setIsGenerating(false);
                    },
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
            setAbortController,
            setIsGenerating,
            updateThreadItem,
            updateThreadItemCache,
            fetchRemainingCredits,
            AGENT_EVENT_TYPES,
            threadItemCache,
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
            };

            createThreadItem(aiThreadItem);
            setCurrentThreadItem(aiThreadItem);
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
