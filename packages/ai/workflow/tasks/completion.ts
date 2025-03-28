import { ChatMode } from '@repo/shared/config';
import { tool } from 'ai';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import { buildAllTools } from '../../tools/mcp';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import {
    executeWebSearch,
    generateObject,
    generateText,
    getHumanizedDate,
    getSERPResults,
    processWebPages,
} from '../utils';
import { generateErrorMessage } from './utils';

const webSearchTool = tool({
    description: 'Search the web for information',
    parameters: z.object({
        query: z.string({
            message: 'The query to search the web for',
        }),
    }),
    execute: async ({ query }) => {
        const response = await executeWebSearch([query]);
        return await processWebPages(response || []);
    },
});

const getModelFromChatMode = (mode?: string): ModelEnum => {
    switch (mode) {
        case ChatMode.GEMINI_2_FLASH:
            return ModelEnum.GEMINI_2_FLASH;
        case ChatMode.DEEPSEEK_R1:
            return ModelEnum.Deepseek_R1;
        case ChatMode.CLAUDE_3_5_SONNET:
            return ModelEnum.Claude_3_5_Sonnet;
        case ChatMode.CLAUDE_3_7_SONNET:
            return ModelEnum.Claude_3_7_Sonnet;
        case ChatMode.O3_Mini:
            return ModelEnum.O3_Mini;
        default:
            return ModelEnum.GPT_4o_Mini;
    }
};

const buildWebSearchPrompt = (results: any[]): string => {
    const today = new Date().toLocaleDateString();

    let prompt = `You are a helpful assistant that can answer questions and help with tasks.
Today is ${today}.

${results
    .map(
        (result, index) => `
<result-${index}>
    <title>${result.title}</title>
    <snippet>${result.snippet}</snippet>
    <link>${result.link}</link>
</result-${index}>
`
    )
    .join('\n')}

<citation-method>
    - Use inline citations with <Source> tags for each statement where possible.
    - Example: According to recent findings <Source>https://www.example.com</Source>, progress in this area has accelerated
    - When information appears in multiple sources, cite all relevant sources
    - Use multiple citations for each statement if multiple sources stated the same information.
    - Integrate citations naturally without disrupting reading flow
</citation-method>`;

    return prompt;
};

const buildPrompt = (): string => {
    const today = new Date().toLocaleDateString();

    let prompt = `You are a helpful assistant that can answer questions and help with tasks.
Today is ${today}.
`;

    return prompt;
};

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

        try {
            const response = await generateText({
                model,
                messages,
                prompt: buildPrompt(),
                signal,
                toolChoice: 'auto',
                maxSteps: webSearch ? 2 : 8,
                tools: {
                    ...(tools?.allTools || {}),
                    ...(webSearch ? { 'llmchat-web-search': webSearchTool } : {}),
                },
                onReasoning: reasoning => {
                    events?.update('flow', prev => ({
                        ...prev,
                        reasoning: {
                            text: reasoning,
                            final: true,
                            status: 'COMPLETED',
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
                            final: false,
                            status: 'PENDING',
                        },
                    }));
                },
            });

            events?.update('flow', prev => ({
                ...prev,
                answer: {
                    text: response,
                    final: true,
                    status: 'COMPLETED',
                },
                final: true,
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

export const quickSearchTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'quickSearch',
    execute: async ({ events, context, signal }) => {
        const messages =
            context
                ?.get('messages')
                ?.filter(
                    message =>
                        (message.role === 'user' || message.role === 'assistant') &&
                        !!message.content
                ) || [];

        console.log('messages', messages);

        const chatMode = context?.get('mode');
        const model = getModelFromChatMode(chatMode);

        const query = await generateObject({
            prompt: `Today is ${getHumanizedDate()}. Generate a query to search the web for information make sure query is not too broad and be specific for recent information`,
            model: ModelEnum.GPT_4o_Mini,
            messages,
            schema: z.object({
                query: z.string(),
            }),
        });
        if (!query.query) {
            throw new Error('No query generated');
        }
        const results = await getSERPResults([query.query]);
        console.log(results);
        events?.update('flow', prev => ({
            ...prev,
            goals: {
                ...prev.goals,
                0: {
                    ...prev.goals?.[0],
                    status: 'COMPLETED',
                } as any,
            },
            steps: {
                ...prev.steps,
                0: {
                    ...prev.steps?.[0],
                    type: 'search',
                    queries: [query.query],
                    final: true,
                    status: 'COMPLETED',
                } as any,
                1: {
                    ...prev.steps?.[1],
                    type: 'read',
                    results: results.map((result: any) => ({
                        title: result.title,
                        link: result.link,
                    })),
                    final: false,
                    status: 'PENDING',
                } as any,
            },
        }));

        const searchContent = results.reduce((acc: string, result: any) => {
            return acc + `\n${result.title}\n${result.snippet}\n${result.link}`;
        }, '');

        const response = await generateText({
            model,
            messages: [...messages, { role: 'user', content: searchContent }],
            prompt: buildWebSearchPrompt(results),
        });

        events?.update('flow', prev => ({
            ...prev,
            steps: {
                ...prev.steps,
                1: {
                    ...prev.steps?.[1],
                    final: true,
                    status: 'COMPLETED',
                } as any,
            },
            answer: {
                text: response,
                final: true,
                status: 'COMPLETED',
            },
            final: true,
            status: 'COMPLETED',
        }));

        context?.update('answer', _ => response);

        const onFinish = context?.get('onFinish');
        if (onFinish) {
            onFinish({
                answer: response,
                threadId: context?.get('threadId'),
                threadItemId: context?.get('threadItemId'),
            });
        }

        return {
            retry: false,
            result: 'success',
        };
    },
    route: ({ context }) => {
        if (context?.get('showSuggestions') && context.get('answer')) {
            return 'suggestions';
        }
        return 'end';
    },
});
