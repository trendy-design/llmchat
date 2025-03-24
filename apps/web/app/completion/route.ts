import { CompletionMode, deepResearchWorkflow } from '@repo/ai';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const completionRequestSchema = z.object({
    threadId: z.string(),
    threadItemId: z.string(),
    parentThreadItemId: z.string(),
    prompt: z.string(),
    messages: z.any(),
    mode: z.nativeEnum(CompletionMode),
    maxIterations: z.number().optional(),
    mcpConfig: z.record(z.string(), z.string()).optional(),
    webSearch: z.boolean().optional(),
    showSuggestions: z.boolean().optional(),
});

export type CompletionRequestType = z.infer<typeof completionRequestSchema>;

export type AgentEventResponse = {
    threadId: string;
    threadItemId: string;
    parentThreadItemId: string;
};

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
                if (
                    typeof error === 'object' &&
                    error !== null &&
                    'name' in error &&
                    error.name === 'AbortError'
                ) {
                    sendMessage(controller, encoder, { type: 'done', status: 'aborted' });
                } else {
                    sendMessage(controller, encoder, {
                        type: 'done',
                        status: 'error',
                        error: String(error),
                    });
                }
                controller.close();
            }
        },
        cancel() {
            abortController.abort();
        },
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
        console.log('data', data);
        const workflow = deepResearchWorkflow({
            mode: data.mode,
            question: data.prompt,
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            messages: data.messages as any,
            webSearch: data.webSearch || false,
            config: {
                maxIterations: data.maxIterations || 3,
                signal,
            },
            mcpConfig: data.mcpConfig || {},
            showSuggestions: data.showSuggestions || false,
        });

        workflow.on('flow', payload => {
            sendMessage(controller, encoder, {
                type: 'message',
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
                ...payload,
            });
        });

        // start should be typed

        const result = await workflow.start('router', {
            question: data.prompt,
        });

        sendMessage(controller, encoder, {
            type: 'done',
            status: 'complete',
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
            result,
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
                parentThreadItemId: data.parentThreadItemId,
            });
        } else {
            sendMessage(controller, encoder, {
                type: 'done',
                status: 'error',
                error: String(error),
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
            });
        }
        controller.close();
        throw error;
    }
}

function sendMessage(controller: StreamController, encoder: TextEncoder, payload: any) {
    try {
        // Sanitize payload to ensure it can be safely serialized
        const sanitizedPayload = sanitizePayloadForJSON(payload);
        const message = `event: message\ndata: ${JSON.stringify(sanitizedPayload)}\n\n`;
        controller.enqueue(encoder.encode(message));
    } catch (error) {
        console.error('Error serializing message payload:', error);
        // Send a simplified error message that will parse correctly
        const errorMessage = `event: message\ndata: ${JSON.stringify({
            type: payload.type,
            status: 'error',
            error: 'Failed to serialize payload',
            threadId: payload.threadId,
            threadItemId: payload.threadItemId,
            parentThreadItemId: payload.parentThreadItemId,
        })}\n\n`;
        controller.enqueue(encoder.encode(errorMessage));
    }
}

// Helper function to sanitize payload before JSON serialization
function sanitizePayloadForJSON(payload: any): any {
    try {
        if (payload === null || payload === undefined) {
            return payload;
        }

        if (typeof payload === 'string') {
            // Ensure strings are valid for JSON
            return payload;
        }

        if (typeof payload !== 'object') {
            return payload;
        }

        // Handle arrays
        if (Array.isArray(payload)) {
            return payload.map(item => sanitizePayloadForJSON(item));
        }

        // Handle objects
        const sanitized: Record<string, any> = {};
        for (const [key, value] of Object.entries(payload)) {
            // Skip functions and other non-serializable types
            if (typeof value !== 'function' && typeof value !== 'symbol') {
                sanitized[key] = sanitizePayloadForJSON(value);
            }
        }

        return sanitized;
    } catch (error) {
        console.error('Error sanitizing payload:', error);
        return {};
    }
}
