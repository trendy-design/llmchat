import { tool } from 'ai';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import { buildAllTools } from '../../tools/mcp';
import { CompletionMode, WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { executeWebSearch, generateText } from '../utils';


const webSearchTool = tool({
        description: 'Search the web for information',
        parameters: z.object({
                query: z.string({
                        message: "The query to search the web for"
                })
        }),
        execute: async ({ query }) => {
                const response = await executeWebSearch([query]);
                return response;
        }
})

export const completionTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
        name: 'completion',
        execute: async ({ trace, events, context, data }) => {

                const messages = context?.get('messages')?.filter((message) => (message.role === 'user' || message.role === 'assistant') && !!message.content) || [];
                const mode = context?.get('mode')

                const mcpConfig = context?.get('mcpConfig') || {};

                console.log("messages", messages);

                let model: ModelEnum;

                if (mode === CompletionMode.GEMINI_2_FLASH) {
                        model = ModelEnum.GEMINI_2_FLASH;
                }
                else if (mode === CompletionMode.DEEPSEEK_R1) {
                        model = ModelEnum.Deepseek_R1;
                }
                else if (mode === CompletionMode.CLAUDE_3_5_SONNET) {
                        model = ModelEnum.Claude_3_5_Sonnet;
                }
                else if (mode === CompletionMode.CLAUDE_3_7_SONNET) {
                        model = ModelEnum.Claude_3_7_Sonnet;
                }
                else if (mode === CompletionMode.O3_Mini) {
                        model = ModelEnum.O3_Mini;
                }
                else {
                        model = ModelEnum.GPT_4o_Mini;
                }

                const prompt = `
                You are a helpful assistant that can answer questions and help with tasks.
                Today is ${new Date().toLocaleDateString()}.
                `;

                const config = {
                        proxyEndpoint: process.env.NEXT_PUBLIC_APP_URL + "/mcp/proxy",
                        mcpServers: mcpConfig
                }

                const tools = await buildAllTools(config);



                const response = await generateText({
                        model,
                        messages: messages,
                        prompt,
                        tools: tools?.allTools,
                        onReasoning: (reasoning) => {
                                console.log("reasoning", reasoning);
                                events?.update('flow', (prev) => ({
                                        ...prev,
                                        reasoning: {
                                                text: reasoning,
                                                final: true,
                                                status: 'COMPLETED'
                                        }
                                }));
                        },
                        onToolCall: (toolCall) => {
                                console.log("tool-call", toolCall);
                                events?.update('flow', (prev) => ({
                                        ...prev,
                                        toolCalls: toolCall
                                }));
                        },
                        onToolResult: (toolResult) => {
                                events?.update('flow', (prev) => ({
                                        ...prev,
                                        toolResults: toolResult
                                }));
                                console.log("tool-result", toolResult);
                        },
                        onChunk: (chunk) => {
                                console.log("chunk", chunk);
                                events?.update('flow', (prev) => ({
                                        ...prev,
                                        answer: {
                                                text: chunk,
                                                final: false,
                                                status: 'PENDING'
                                        }
                                }));
                        }
                });

                events?.update('flow', (prev) => ({
                        ...prev,
                        answer: {
                                text: response,
                                final: true,
                                status: 'COMPLETED'
                        }
                }));

                tools?.onClose();


        }
});



