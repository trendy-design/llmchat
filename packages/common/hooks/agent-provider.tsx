import { useAuth } from '@clerk/nextjs';
import { useWorkflowWorker } from '@repo/ai/worker';
import { nanoid } from 'nanoid';
import { useParams, useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext } from 'react';
import { useApiKeysStore, useAppStore, useChatStore, useMcpToolsStore } from '../store';
import { Goal, Step, ThreadItem } from '../store/chat.store';

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

    const router = useRouter();
    const { startWorkflow, abortWorkflow } = useWorkflowWorker(data => {
        if (data.type === 'message' && data?.threadId && data?.threadItemId) {
            const goalsArray = data.goals ? Object.values(data.goals) : [];
            const stepsArray = data.steps ? Object.values(data.steps) : [];

            updateThreadItem(data?.threadId, {
                id: data?.threadItemId,
                parentId: data?.parentThreadItemId,
                threadId: data?.threadId,
                goals: goalsArray as Goal[],
                steps: stepsArray as Step[],
                answer: data?.answer,
                final: data?.final,
                status: data?.status,
                query: data?.query,
                error: data?.error,
                reasoning: data?.reasoning,
                toolCalls: data?.toolCalls,
                toolResults: data?.toolResults,
                suggestions: data?.suggestions,
            });
        }
        if (data.type === 'done') {
            setIsGenerating(false);
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
                final: true,
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
                                    currentEvent === 'message' &&
                                    data.type === 'message' &&
                                    data?.threadId &&
                                    data?.threadItemId
                                ) {
                                    const goalsArray = data.goals ? Object.values(data.goals) : [];
                                    const stepsArray = data.steps ? Object.values(data.steps) : [];

                                    updateThreadItem(data?.threadId, {
                                        id: data?.threadItemId,
                                        parentId: data?.parentThreadItemId,
                                        threadId: data?.threadId,
                                        goals: goalsArray as Goal[],
                                        steps: stepsArray as Step[],
                                        answer: data?.answer,
                                        final: data?.final,
                                        status: data?.status,
                                        query: data?.query,
                                        error: data?.error,
                                        updatedAt: new Date(),
                                        mode: data?.mode,
                                        reasoning: data?.reasoning,
                                        toolCalls: data?.toolCalls,
                                        toolResults: data?.toolResults,
                                        suggestions: data?.suggestions,
                                        persistToDB:
                                            Date.now() - lastDbUpdate >= DB_UPDATE_INTERVAL,
                                    });

                                    if (Date.now() - lastDbUpdate >= DB_UPDATE_INTERVAL) {
                                        lastDbUpdate = Date.now();
                                    }
                                } else if (currentEvent === 'done' && data.type === 'done') {
                                    setIsGenerating(false);
                                    setTimeout(() => {
                                        fetchRemainingCredits();
                                    }, 1000);

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
        } finally {
            reader.releaseLock();
            setIsGenerating(false);
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

        const aiThreadItem: ThreadItem = {
            id: optimisticAiThreadItemId,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'QUEUED' as const,
            threadId,
            query: formData.get('query') as string,
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
                    content: item.query || '',
                },
                {
                    role: 'assistant' as const,
                    content: item.answer?.text || '',
                },
            ]) || []),
            {
                role: 'user' as const,
                content: (formData.get('query') as string) || '',
            },
        ];

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
