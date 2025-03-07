import {
        AgentContextManager,
        AgentEventPayload,
        AgentGraphEvents,
        GraphStateManager,
        LLMMessageSchema,
} from '@repo/ai';
import { ModelEnum } from '@repo/ai/models';
import { completion, deepResearchWorkflow, fastSearchWorkflow } from '@repo/workflows';
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
        const events = new AgentGraphEvents();

        const stream = new ReadableStream({
                async start(controller) {
                        try {
                                await executeStream(controller, encoder, events, data);
                        } catch (error) {
                                console.error(error);
                        }
                },
        });

        return new Response(stream, { headers: SSE_HEADERS });
}

async function executeStream(
        controller: StreamController,
        encoder: TextEncoder,
        events: AgentGraphEvents,
        data: CompletionRequestType
) {




        const graph = await getGraph(data.mode, data, events, controller, encoder);

        events.on('event', event => {
                sendMessage(controller, encoder, {
                        threadId: data.threadId,
                        threadItemId: data.threadItemId,
                        parentThreadItemId: data.parentThreadItemId,
                        type: 'event',
                        ...event,
                });

                if (event.status === 'error') {
                        controller.close();
                }
        });

        const result = await graph.execute('initiator', data.prompt);
        controller.close();
}

function sendMessage(
        controller: StreamController,
        encoder: TextEncoder,
        payload: any
) {
        const message = `event: message\ndata: ${JSON.stringify(payload)}\n\n`;
        controller.enqueue(encoder.encode(message));
}

async function getGraph(mode: CompletionMode, completionRequest: CompletionRequestType, events: AgentGraphEvents,
        controller: StreamController,
        encoder: TextEncoder
) {

        const contextManager = new AgentContextManager({
                initialContext: {
                        history: completionRequest.messages,
                },
                onContextUpdate: (context) => {
                        if (context.webSearchResults) {
                                sendMessage(controller, encoder, {
                                        threadId: completionRequest.threadId,
                                        threadItemId: completionRequest.threadItemId,
                                        parentThreadItemId: completionRequest.parentThreadItemId,
                                        type: "context",
                                        context: {
                                                searchResults: context.webSearchResults,
                                        },

                                });
                        }
                },
        });
        const stateManager = new GraphStateManager({
                onStateUpdate: (state) => {
                },
        });

        switch (mode) {
                case CompletionMode.Fast:
                        return fastSearchWorkflow(events, contextManager, stateManager);
                case CompletionMode.Deep:
                        return deepResearchWorkflow(events, contextManager, stateManager);
                case CompletionMode.GPT_4o_Mini:
                        return completion(ModelEnum.GPT_4o_Mini, events, contextManager, stateManager);
                case CompletionMode.GEMINI_2_FLASH:
                        return completion(ModelEnum.GEMINI_2_FLASH, events, contextManager, stateManager);
                default:
                        throw new Error(`Unsupported completion mode: ${mode}`);
        }
}
