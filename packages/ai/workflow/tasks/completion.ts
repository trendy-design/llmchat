import { tool } from 'ai';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import { buildAllTools } from '../../tools/mcp';
import { CompletionMode, WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { executeWebSearch, generateText, processWebPages } from '../utils';

const webSearchTool = tool({
    description: 'Search the web for information',
    parameters: z.object({
        query: z.string({
            message: 'The query to search the web for',
        }),
    }),
    execute: async ({ query }) => {
        const response = await executeWebSearch([query]);
        const processedResults = await processWebPages(response || []);
        return processedResults;
    },
});

export const completionTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'completion',
    execute: async ({ events, context, signal }) => {
        const messages =
            context
                ?.get('messages')
                ?.filter(
                    message =>
                        (message.role === 'user' || message.role === 'assistant') &&
                        !!message.content
                ) || [];
        const mode = context?.get('mode');
        const webSearch = context?.get('webSearch') || false;
        const mcpConfig = context?.get('mcpConfig') || {};

        let model: ModelEnum;

        if (mode === CompletionMode.GEMINI_2_FLASH) {
            model = ModelEnum.GEMINI_2_FLASH;
        } else if (mode === CompletionMode.DEEPSEEK_R1) {
            model = ModelEnum.Deepseek_R1;
        } else if (mode === CompletionMode.CLAUDE_3_5_SONNET) {
            model = ModelEnum.Claude_3_5_Sonnet;
        } else if (mode === CompletionMode.CLAUDE_3_7_SONNET) {
            model = ModelEnum.Claude_3_7_Sonnet;
        } else if (mode === CompletionMode.O3_Mini) {
            model = ModelEnum.O3_Mini;
        } else {
            model = ModelEnum.GPT_4o_Mini;
        }

        const prompt = `
                You are a helpful assistant that can answer questions and help with tasks.
                Today is ${new Date().toLocaleDateString()}.

                ${
                    webSearch
                        ? `<citation-method>
                    - Use inline citations with <Source> tags for each statement where possible.
                    - Example: According to recent findings <Source>https://www.example.com</Source>, progress in this area has accelerated
                    - When information appears in multiple sources, cite all relevant sources
                    - Use multiple citations for each statement if multiple sources stated the same information.
                    - Integrate citations naturally without disrupting reading flow
                </citation-method>
                `
                        : ''
                }
        `;

        const config = {
            proxyEndpoint: process.env.NEXT_PUBLIC_APP_URL + '/mcp/proxy',
            mcpServers: mcpConfig,
        };

        let tools: Awaited<ReturnType<typeof buildAllTools>> | undefined = undefined;
        let toolsInstance: Awaited<ReturnType<typeof buildAllTools>> | undefined = undefined;

        if (Object.values(mcpConfig)?.length !== 0) {
            toolsInstance = await buildAllTools(config);
            tools = toolsInstance;
        }

        const toolCallsMap: Record<string, any> = {};
        const toolResultsMap: Record<string, any> = {};

        console.log('tools', tools);
        const response = await generateText({
            model,
            messages,
            prompt,
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
                if (toolCall.toolName !== 'llmchat-web-search') {
                    toolCallsMap[toolCall.toolCallId] = toolCall;

                    events?.update('flow', prev => ({
                        ...prev,
                        toolCalls: toolCallsMap as any,
                    }));
                } else {
                    events?.update('flow', prev => ({
                        ...prev,
                        goals: {
                            ...prev.goals,
                            0: {
                                id: 0,
                                text: '',
                                final: false,
                                status: 'PENDING',
                            },
                        },
                        steps: {
                            ...prev.steps,
                            0: {
                                type: 'search',
                                final: true,
                                goalId: 0,
                                queries: [toolCall.args.query],
                            },
                        },
                    }));
                }
            },
            onToolResult: toolResult => {
                console.log('toolResult', toolResult);
                if (toolResult.toolName !== 'llmchat-web-search') {
                    toolResultsMap[toolResult.toolCallId] = toolResult;
                    events?.update('flow', prev => ({
                        ...prev,
                        toolResults: toolResultsMap as any,
                    }));
                } else {
                    events?.update('flow', prev => ({
                        ...prev,
                        goals: {
                            ...prev.goals,
                            0: {
                                ...(prev.goals?.[0] || {}),
                                status: 'COMPLETED',
                            } as any,
                        },
                        steps: {
                            ...prev.steps,
                            1: {
                                type: 'read',
                                final: true,
                                goalId: 0,
                                results: toolResult.result?.map((result: any) => ({
                                    title: result.title,
                                    link: result.link,
                                })),
                            },
                        },
                    }));
                }
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
        }));

        context?.update('answer', _ => response);

        toolsInstance?.onClose();
    },
    onError: (error, { context, events }) => {
        console.error('Task failed', error);
        events?.update('flow', prev => ({
            ...prev,
            error: 'Something went wrong while processing your request. Please try again.',
            status: 'ERROR',
        }));
        return Promise.resolve({
            retry: false,
            result: 'error',
        });
    },
    route: ({ context }) => {
        console.log('context', context);
        if (context?.get('showSuggestions')) {
            return 'suggestions';
        }
        return 'end';
    },
});
