import { createTask } from '@repo/orchestrator';
import { AnswerMessage, ToolCall } from '@repo/shared/types';
import { CoreAssistantMessage, CoreToolMessage, ToolSet } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getModelFromChatMode } from '../../models';
import { MCPToolManager } from '../../tools/MCPToolManager';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import {
    ChunkBuffer,
    generateObject,
    generateText,
    getHumanizedDate,
    handleError,
    sendEvents,
} from '../utils';

export const agenticPlannerTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'agentic-planner',
    execute: async ({ events, context, signal, redirectTo, interrupt }) => {
        if (!context) {
            throw new Error('Context is required but was not provided');
        }
        const { addAnswerMessage } = sendEvents(events);

        const optimisticTextMessageId = uuidv4();
        const mcpConfig = context.get('mcpConfig') || {};
        let mcpToolManager: MCPToolManager | undefined;

        let tools: ToolSet | undefined;

        if (mcpConfig) {
            mcpToolManager = await MCPToolManager.create(mcpConfig);
            await mcpToolManager?.initialize({ shouldExecute: false });
            if (mcpToolManager) {
                tools = mcpToolManager.getTools();
            }
        }

        let messages =
            context
                .get('messages')
                ?.filter(
                    message =>
                        (message.role === 'user' ||
                            message.role === 'assistant' ||
                            message.role === 'tool') &&
                        !!message.content
                ) || [];

        const mode = context.get('mode');

        const model = getModelFromChatMode(mode);

        const response = await generateObject({
            model,
            messages,
            prompt: `Today is ${getHumanizedDate()}.

You are a helpful assistant that can answer questions and help with tasks.

You may be given a task to complete. analyze the task and come up with a plan to complete the task using the tools provided.

First check for necessary connection to tools before using them.

You can use the following tools to help you:
${tools ? JSON.stringify(tools) : 'No tools available'}

`,
            signal,
            schema: z.object({
                plan: z
                    .array(z.string())
                    .describe('How to do the task. This should be a list of steps.'),
                reasoning: z
                    .string()
                    .describe('How you came up with the plan. This should be a short explanation.'),
            }),
        });

        if (response) {
            context.update('agenticPlan', _ => {
                return {
                    plan: response.plan,
                    reasoning: response.reasoning,
                };
            });

            addAnswerMessage({
                id: optimisticTextMessageId,
                type: 'text',
                text: response.reasoning,
                isFullText: true,
            });

            addAnswerMessage({
                id: optimisticTextMessageId,
                type: 'text',
                text: `Plan: ${response.plan.join('\n')}`,
                isFullText: true,
            });
        }
    },
    onError: handleError,
    route: ({ context }) => {
        return 'agentic';
    },
});

export const agenticTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'agentic',
    execute: async ({ events, context, signal, redirectTo, interrupt }) => {
        if (!context) {
            throw new Error('Context is required but was not provided');
        }
        const { updateStatus, updateAnswer, updateStep, addAnswerMessage } = sendEvents(events);

        const agenticPlan = context.get('agenticPlan');
        if (!agenticPlan) {
            throw new Error('Agentic plan is required but was not provided');
        }

        const steps = agenticPlan.plan;

        const optimisticTextMessageId = uuidv4();

        let messages =
            context
                .get('messages')
                ?.filter(
                    message =>
                        (message.role === 'user' ||
                            message.role === 'assistant' ||
                            message.role === 'tool') &&
                        !!message.content
                ) || [];

        const waitForApproval = context.get('waitForApproval') || false;
        const waitForApprovalMetadata = context.get('waitForApprovalMetadata') || undefined;

        const mode = context.get('mode');
        const mcpConfig = context.get('mcpConfig') || {};

        let tools: ToolSet | undefined;

        let mcpToolManager: MCPToolManager | undefined;

        const chunkBuffer = new ChunkBuffer({
            threshold: 200,
            breakOn: ['\n'],
            onFlush: (text: string) => {
                console.log('chunk', text);
                events?.update('answer', a => {
                    const hasMessage = a.messages?.find(m => m.id === optimisticTextMessageId);
                    if (hasMessage) {
                        return {
                            ...a,
                            messages: a.messages?.map(m => {
                                if (m.id === optimisticTextMessageId) {
                                    return { ...m, text: text, isFullText: false };
                                }
                                return m;
                            }),
                        };
                    }

                    return {
                        ...a,
                        messages: [
                            ...(a.messages || []),
                            { id: optimisticTextMessageId, type: 'text', text, isFullText: false },
                        ],
                    };
                });
            },
        });

        if (mcpConfig) {
            mcpToolManager = await MCPToolManager.create(mcpConfig);
            await mcpToolManager?.initialize({ shouldExecute: false });
            if (mcpToolManager) {
                tools = mcpToolManager.getTools();
            }
        }

        const model = getModelFromChatMode(mode);

        if (waitForApproval) {
            // get last tool waiting for approval
            const toolCall = waitForApprovalMetadata as ToolCall;

            // execute tool
            const result = await mcpToolManager?.executeTool(toolCall);

            if (!result) {
                throw new Error('Tool execution failed');
            }
            // add tool message to messages
            const toolMessage: CoreToolMessage = {
                role: 'tool',
                content: [result],
            };

            events?.update('answer', a => {
                const updatedMessages = a.messages?.map(m => {
                    if (m.type === 'tool-call' && m.toolCallId === toolCall.toolCallId) {
                        return {
                            ...m,
                            approvalStatus: 'APPROVED',
                        };
                    }
                    return m;
                }) as Array<AnswerMessage>;
                return {
                    ...a,
                    messages: [
                        ...(updatedMessages || []),
                        {
                            id: toolCall.toolCallId,
                            type: 'tool-result',
                            toolCallId: toolCall.toolCallId,
                            toolName: toolCall.toolName,
                            result: result,
                            approvalStatus: 'APPROVED',
                        },
                    ],
                };
            });

            context.update('messages', m => [...(m || []), toolMessage]);

            context.update('waitForApproval', _ => false);
            context.update('waitForApprovalMetadata', _ => undefined);

            messages = context.get('messages') || [];
        }
        console.log('tools', tools, mcpConfig);

        let prompt = `You are a helpful assistant that can answer questions and help with tasks.
Today is ${getHumanizedDate()}.

Here are the steps you are working on:
${steps.map(step => `- ${step}`).join('\n')}

stick to the steps and do not do anything else. If step is already completed, do not do anything.

You may be given a task to complete. analyze the task and come up with a plan to complete the task using the tools provided.

First check for necessary connection to tools before using them.

`;

        const response = await generateText({
            model,
            messages,
            prompt,
            signal,
            toolChoice: 'auto',
            maxSteps: 2,
            tools,
            onToolCall: toolCall => {
                console.log('toolCall', toolCall);

                events?.update('answer', a => {
                    return {
                        ...a,
                        messages: [
                            ...(a.messages || []),
                            { ...toolCall, approvalStatus: 'PENDING', id: toolCall.toolCallId },
                        ],
                    };
                });

                const toolCallMessage: CoreAssistantMessage = {
                    role: 'assistant',
                    content: [toolCall],
                };

                context.update('messages', _ => [...messages, toolCallMessage]);

                context.update('waitForApproval', _ => true);
                context.update('waitForApprovalMetadata', _ => {
                    return toolCall;
                });
            },
            onChunk: (chunk, fullText) => {
                chunkBuffer.add(chunk);
            },
        });

        chunkBuffer.end();

        const reflection = await generateObject({
            model,
            messages,
            schema: z.object({
                reflection: z
                    .string()
                    .describe('What went well? What could have been done better?'),
            }),
            prompt: `Just reflect on last task you did.`,
        });

        // if (reflection) {
        //     addAnswerMessage({
        //         id: uuidv4(),
        //         type: 'text',
        //         text: `Reflection: ${reflection.reflection}`,
        //         isFullText: true,
        //     });
        // }

        if (context.get('waitForApproval') || false) {
            interrupt(context.get('waitForApprovalMetadata') as ToolCall);
        }

        updateAnswer({
            text: undefined,
            message: [],
            status: 'COMPLETED',
        });

        updateStatus('COMPLETED');
    },
    onError: handleError,
    route: ({ context }) => {
        // if (context?.get('waitForApproval') || false) {
        //     return 'agentic';
        // }
        return 'end';
    },
});
