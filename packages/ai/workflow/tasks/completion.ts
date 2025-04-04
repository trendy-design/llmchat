import { createTask } from '@repo/orchestrator';
import { getModelFromChatMode } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { ChunkBuffer, generateText, getHumanizedDate } from '../utils';
import { generateErrorMessage } from './utils';

export const completionTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'completion',
    execute: async ({ events, context, signal, redirectTo }) => {
        if (!context) {
            throw new Error('Context is required but was not provided');
        }

        const messages =
            context
                .get('messages')
                ?.filter(
                    message =>
                        (message.role === 'user' || message.role === 'assistant') &&
                        !!message.content
                ) || [];

        const mode = context.get('mode');
        const webSearch = context.get('webSearch') || false;
        const mcpConfig = context.get('mcpConfig') || {};

        if (webSearch) {
            redirectTo('quickSearch');
            return;
        }

        const model = getModelFromChatMode(mode);

        // const config = {
        //     proxyEndpoint: process.env.NEXT_PUBLIC_APP_URL + '/mcp/proxy',
        //     mcpServers: mcpConfig,
        // };

        // let toolsInstance = undefined;
        // let tools = undefined;

        // if (Object.keys(mcpConfig).length > 0) {
        //     toolsInstance = await buildAllTools(config);
        //     tools = toolsInstance;
        // }

        const toolCallsMap: Record<string, any> = {};
        const toolResultsMap: Record<string, any> = {};

        let prompt = `You are a helpful assistant that can answer questions and help with tasks.
        Today is ${getHumanizedDate()}.
        `;

        const reasoningBuffer = new ChunkBuffer({
            threshold: 200,
            breakOn: ['\n\n'],
            onFlush: (_chunk: string, fullText: string) => {
                events?.update('steps', prev => ({
                    ...prev,
                    0: {
                        ...prev?.[0],
                        id: 0,
                        status: 'COMPLETED',
                        steps: {
                            ...prev?.[0]?.steps,
                            reasoning: {
                                data: fullText,
                                status: 'COMPLETED',
                            },
                        },
                    },
                }));
            },
        });

        const chunkBuffer = new ChunkBuffer({
            threshold: 200,
            breakOn: ['\n'],
            onFlush: (text: string) => {
                events?.update('answer', current => ({
                    ...current,
                    text,
                    status: 'PENDING' as const,
                }));
            },
        });

        try {
            const response = await generateText({
                model,
                messages,
                prompt,
                signal,
                toolChoice: 'auto',
                maxSteps: 2,
                // tools: {
                //     ...(tools?.allTools || {}),
                // },
                onReasoning: (chunk, fullText) => {
                    reasoningBuffer.add(chunk);
                },
                onToolCall: toolCall => {
                    toolCallsMap[toolCall.toolCallId] = toolCall;
                    events?.update('toolCalls', prev => ({
                        ...prev,
                        ...(toolCallsMap as any),
                    }));
                },
                onToolResult: toolResult => {
                    toolResultsMap[toolResult.toolCallId] = toolResult;
                    events?.update('toolResults', prev => ({
                        ...prev,
                        ...(toolResultsMap as any),
                    }));
                },
                onChunk: (chunk, fullText) => {
                    chunkBuffer.add(chunk);
                },
            });

            reasoningBuffer.end();
            chunkBuffer.end();

            events?.update('answer', prev => ({
                ...prev,
                text: '',
                fullText: response,
                status: 'COMPLETED',
            }));

            context.update('answer', _ => response);

            events?.update('status', prev => 'COMPLETED');

            const onFinish = context.get('onFinish');
            if (onFinish) {
                onFinish({
                    answer: response,
                    threadId: context.get('threadId'),
                    threadItemId: context.get('threadItemId'),
                });
            }
        } finally {
            // if (toolsInstance?.onClose) {
            //     toolsInstance.onClose();
            // }
        }
    },
    onError: (error, { context, events }) => {
        const errorMessage = generateErrorMessage(error);
        console.error('Task failed', error);

        events?.update('error', prev => ({
            ...prev,
            error: errorMessage,
            status: 'ERROR',
        }));

        return Promise.resolve({
            retry: false,
            result: 'error',
        });
    },
    route: ({ context }) => {
        if (context?.get('showSuggestions') && context.get('answer')) {
            return 'suggestions';
        }
        return 'end';
    },
});
