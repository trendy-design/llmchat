import {
  AgentContextManager,
  AgentEventPayload,
  AgentGraphEvents,
  completionRequestSchema,
  CompletionRequestType
} from "@repo/ai";
import { workflow1 } from "@repo/workflows";
import type { NextRequest } from 'next/server';

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
  const contextManager = new AgentContextManager({
    threadId: data.threadId,
    threadItemId: data.threadItemId,
    parentThreadItemId: data.parentThreadItemId,
    history: data.messages,
  });

  const graph = await workflow1(events, contextManager);

  events.on('event', (event) => {
    sendMessage(controller, encoder, {
      threadId: data.threadId,
      threadItemId: data.threadItemId,
      parentThreadItemId: data.parentThreadItemId,
      ...event,
    });

    if (event.status === 'error') {
      controller.close();
    }
  });

  await graph.execute("initiator", data.prompt);
  controller.close();
}

function sendMessage(
  controller: StreamController,
  encoder: TextEncoder,
  payload: AgentEventResponse
) {
  const message = `event: message\ndata: ${JSON.stringify(payload)}\n\n`;
  controller.enqueue(encoder.encode(message));
}
