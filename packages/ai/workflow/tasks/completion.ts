import { createTask } from '@repo/orchestrator';
import { getModelFromChatMode } from '../../models';
import { buildAllTools } from '../../tools/mcp';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { generateText, getHumanizedDate } from '../utils';
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

        console.log('messages', messages);

        const mode = context.get('mode');
        const webSearch = context.get('webSearch') || false;
        const mcpConfig = context.get('mcpConfig') || {};

        if (webSearch) {
            redirectTo('quickSearch');
            return;
        }

        const model = getModelFromChatMode(mode);

        const config = {
            proxyEndpoint: process.env.NEXT_PUBLIC_APP_URL + '/mcp/proxy',
            mcpServers: mcpConfig,
        };

        let toolsInstance = undefined;
        let tools = undefined;

        if (Object.keys(mcpConfig).length > 0) {
            toolsInstance = await buildAllTools(config);
            tools = toolsInstance;
        }

        const toolCallsMap: Record<string, any> = {};
        const toolResultsMap: Record<string, any> = {};

        let prompt = `You are a helpful assistant that can answer questions and help with tasks.
        Today is ${getHumanizedDate()}.
        `;

        try {
            const response = await generateText({
                model,
                messages,
                prompt,
                signal,
                toolChoice: 'auto',
                maxSteps: 8,
                tools: {
                    ...(tools?.allTools || {}),
                },
                onReasoning: reasoning => {
                    events?.update('flow', prev => ({
                        ...prev,
                        steps: {
                            ...prev?.steps,
                            0: {
                                ...prev?.steps?.[0],
                                id: 0,
                                status: 'COMPLETED',
                                steps: {
                                    ...prev?.steps?.[0]?.steps,
                                    reasoning: {
                                        data: reasoning,
                                        status: 'COMPLETED',
                                    },
                                },
                            },
                        },
                    }));
                },
                onToolCall: toolCall => {
                    toolCallsMap[toolCall.toolCallId] = toolCall;
                    events?.update('flow', prev => ({
                        ...prev,
                        toolCalls: toolCallsMap as any,
                    }));
                },
                onToolResult: toolResult => {
                    toolResultsMap[toolResult.toolCallId] = toolResult;
                    events?.update('flow', prev => ({
                        ...prev,
                        toolResults: toolResultsMap as any,
                    }));
                },
                onChunk: chunk => {
                    events?.update('flow', prev => ({
                        ...prev,

                        answer: {
                            text: chunk,
                            status: 'PENDING',
                        },
                    }));
                },
            });

            events?.update('flow', prev => ({
                ...prev,
                answer: {
                    text: response,
                    status: 'COMPLETED',
                },
                status: 'COMPLETED',
            }));

            context.update('answer', _ => response);

            const onFinish = context.get('onFinish');
            if (onFinish) {
                onFinish({
                    answer: response,
                    threadId: context.get('threadId'),
                    threadItemId: context.get('threadItemId'),
                });
            }
        } finally {
            if (toolsInstance?.onClose) {
                toolsInstance.onClose();
            }
        }
    },
    onError: (error, { context, events }) => {
        const errorMessage = generateErrorMessage(error);
        console.error('Task failed', error);

        events?.update('flow', prev => ({
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
