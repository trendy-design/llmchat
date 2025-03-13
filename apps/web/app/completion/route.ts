import {
        AgentEventPayload,
        deepResearchWorkflow,
        LLMMessageSchema
} from '@repo/ai';
import { NextRequest } from 'next/server';
import { z } from 'zod';


enum CompletionMode {
        Fast = "fast",
        Deep = "deep",
        GPT_4o_Mini = "gpt-4o-mini",
        GEMINI_2_FLASH = "gemini-flash-2.0"
}

const completionRequestSchema = z.object({
        threadId: z.string(),
        threadItemId: z.string(),
        parentThreadItemId: z.string(),
        prompt: z.string(),
        messages: z.array(LLMMessageSchema),
        mode: z.nativeEnum(CompletionMode),
        maxIterations: z.number().optional(),
});

export type CompletionRequestType = z.infer<typeof completionRequestSchema>;


export type AgentEventResponse = {
        threadId: string;
        threadItemId: string;
        parentThreadItemId: string;
} & AgentEventPayload;

type StreamController = ReadableStreamDefaultController<Uint8Array>;

const SSE_HEADERS = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'X-Accel-Buffering': 'no',
} as const;

export async function POST(request: NextRequest) {
        if (request.method === 'OPTIONS') {
                return new Response(null, { headers: SSE_HEADERS });
        }

        const parsed = await request.json();
        const validatedBody = completionRequestSchema.safeParse(parsed);
        if (!validatedBody.success) {
                return new Response('Invalid request body', { status: 400 });
        }

        const { data } = validatedBody;
        const encoder = new TextEncoder();

        // Backend AbortController
        const abortController = new AbortController();

        // Connect frontend abort signal to backend
        request.signal.addEventListener('abort', () => {
                abortController.abort();
        });

        const stream = new ReadableStream({
                async start(controller) {
                        try {
                                await executeStream(controller, encoder, data, abortController);
                        } catch (error) {
                                if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError') {
                                        sendMessage(controller, encoder, { type: 'done', status: 'aborted' });
                                } else {
                                        sendMessage(controller, encoder, { type: 'done', status: 'error', error: String(error) });
                                }
                                controller.close();
                        }
                },
                cancel() {
                        abortController.abort();
                }
        });

        return new Response(stream, { headers: SSE_HEADERS });
}

async function executeStream(
        controller: StreamController,
        encoder: TextEncoder,
        data: CompletionRequestType,
        abortController: AbortController
) {
        try {
                const { signal } = abortController;
                const workflow = deepResearchWorkflow({
                        question: data.prompt,
                        threadId: data.threadId,
                        threadItemId: data.threadItemId,
                        config: {
                                maxIterations: data.maxIterations || 3
                        }
                });

                workflow.on('flow', (payload) => {
                        console.log("event",payload);
                        
                        sendMessage(controller, encoder, { 
                                type: "message", 
                                threadId: data.threadId,
                                threadItemId: data.threadItemId,
                                parentThreadItemId: data.parentThreadItemId,
                                ...payload 
                        });
                });

                // start should be typed

                const result = await workflow.start('initiator', {
                        question: data.prompt
                });

                sendMessage(controller, encoder, { 
                        type: 'done', 
                        status: 'complete',
                        threadId: data.threadId,
                        threadItemId: data.threadItemId,
                        parentThreadItemId: data.parentThreadItemId,
                        result 
                });
                
                controller.close();
                return result;
        } catch (error) {
                if (abortController.signal.aborted) {
                        sendMessage(controller, encoder, { 
                                type: 'done', 
                                status: 'aborted',
                                threadId: data.threadId,
                                threadItemId: data.threadItemId,
                                parentThreadItemId: data.parentThreadItemId
                        });
                } else {
                        sendMessage(controller, encoder, { 
                                type: 'done', 
                                status: 'error', 
                                error: String(error),
                                threadId: data.threadId,
                                threadItemId: data.threadItemId,
                                parentThreadItemId: data.parentThreadItemId
                        });
                }
                controller.close();
                throw error;
        }
}

function sendMessage(
        controller: StreamController,
        encoder: TextEncoder,
        payload: any
) {
        const message = `event: message\ndata: ${JSON.stringify(payload)}\n\n`;
        controller.enqueue(encoder.encode(message));
}


