import { createTask } from '@repo/orchestrator';
import { ToolCall, WorkflowEventSchema } from '@repo/shared/types';
import { CoreAssistantMessage, CoreToolMessage, ToolSet } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getModelFromChatMode } from '../../models';
import { WorkflowContextSchema } from '../flow';
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
        const { updateAnswer } = sendEvents(events);

        const optimisticTextMessageId = uuidv4();

        // Get the tool manager from context - already initialized in flow.ts
        let mcpToolManager = context.get('mcpToolManager');
        let tools: ToolSet | undefined;

        if (mcpToolManager) {
            tools = mcpToolManager.getTools();
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

            updateAnswer({
                message: {
                    id: optimisticTextMessageId,
                    type: 'text',
                    text: response.reasoning,
                    isFullText: true,
                },
                status: 'PENDING',
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
        const { updateStatus, updateAnswer, updateStep } = sendEvents(events);

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

        // Get tool manager from context - already initialized in flow.ts
        let mcpToolManager = context.get('mcpToolManager');
        let tools: ToolSet | undefined;

        if (mcpToolManager) {
            tools = mcpToolManager.getTools();
        }

        const chunkBuffer = new ChunkBuffer({
            threshold: 200,
            breakOn: ['\n'],
            onFlush: (text: string) => {
                console.log('chunk', text);

                updateAnswer({
                    message: {
                        id: optimisticTextMessageId,
                        type: 'text',
                        text,
                        isFullText: false,
                    },
                    status: 'PENDING',
                });
            },
        });

        if (waitForApproval) {
            // get last tool waiting for approval
            const toolCall = waitForApprovalMetadata as ToolCall;

            updateAnswer({
                message: {
                    id: toolCall.toolCallId,
                    type: 'tool-call',
                    toolCallId: toolCall.toolCallId,
                    toolName: toolCall.toolName,
                    args: toolCall.args,
                    approvalStatus: 'RUNNING',
                },
                status: 'PENDING',
            });

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

            updateAnswer({
                message: {
                    id: toolCall.toolCallId,
                    type: 'tool-call',
                    toolCallId: toolCall.toolCallId,
                    toolName: toolCall.toolName,
                    args: toolCall.args,
                    approvalStatus: 'APPROVED',
                },
                status: 'PENDING',
            });

            updateAnswer({
                message: {
                    id: toolCall.toolCallId,
                    type: 'tool-result',
                    toolCallId: toolCall.toolCallId,
                    toolName: toolCall.toolName,
                    result: result,
                    approvalStatus: 'APPROVED',
                },
                status: 'PENDING',
            });

            context.update('messages', m => [...(m || []), toolMessage]);

            context.update('waitForApproval', _ => false);
            context.update('waitForApprovalMetadata', _ => undefined);

            messages = context.get('messages') || [];
        }

        let prompt = `You are a helpful assistant that can answer questions and help with tasks.
Today is ${getHumanizedDate()}.

Here are the steps you are working on:
${steps.map(step => `- ${step}`).join('\n')}

stick to the steps and do not do anything else. If step is already completed, do not do anything.

You may be given a task to complete. analyze the task and come up with a plan to complete the task using the tools provided.

First check for necessary connection to tools before using them.

`;

        const model = getModelFromChatMode(mode);

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

                updateAnswer({
                    message: {
                        id: toolCall.toolCallId,
                        type: 'tool-call',
                        toolCallId: toolCall.toolCallId,
                        toolName: toolCall.toolName,
                        args: toolCall.args,
                        approvalStatus: 'AUTO_APPROVED',
                    },
                    status: 'PENDING',
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
    },
    onError: handleError,
    route: ({ context, events }) => {
        const { updateAnswer, updateStatus } = sendEvents(events);
        if (context?.get('waitForApproval') || false) {
            return 'agentic';
        }

        updateAnswer({
            message: undefined,
            status: 'COMPLETED',
        });

        updateStatus('COMPLETED');
        return 'end';
    },
});
