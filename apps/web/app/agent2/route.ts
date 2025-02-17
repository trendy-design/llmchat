import {
  AgentContextManager,
  AgentEventPayload,
  AgentGraph,
  AgentGraphEvents,
  completionRequestSchema,
  CompletionRequestType
} from "@repo/ai";
import { ToolEnumType } from "@repo/ai/tools";
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

  const graph = new AgentGraph(events, contextManager);

// 1. Initial Search Node
graph.addNode({
  id: "initialSearch",
  name: "Initial Search",
  role: "assistant",
  systemPrompt:
    "Conduct an initial web search using the user’s query. " +
    "Utilize the reader tool to examine the top results. " +
    "Summarize key findings and insights, highlighting relevant sources.",
  tools: [ToolEnumType.SEARCH, ToolEnumType.READER],
  toolSteps: 4,
});

// 2. Deep Search Node
graph.addNode({
  id: "deepSearch",
  name: "Deep Search",
  role: "assistant",
  systemPrompt:
    "Based on the initial findings, perform a more expansive research process. " +
    "Analyze each relevant source in depth. Extract key insights, " +
    "and dynamically discover additional sources as needed. " +
    "Continue until you have a comprehensive understanding of the topic.",
  tools: [ToolEnumType.SEARCH, ToolEnumType.READER],
  toolSteps: 6,
});

// 3. Aggregator Node
graph.addNode({
  id: "aggregator",
  name: "Aggregator",
  role: "assistant",
  systemPrompt:
    "Synthesize all information collected into a thorough, cohesive answer. " +
    "Include important details, context, and properly cite all relevant sources.",
});

// --- Edges ---

// From Initial Search -> Deep Search
graph.addEdge({
  from: "initialSearch",
  to: "deepSearch",
  pattern: "sequential",
  relationship: "next",
});

// Self-Edge (Revision) on Deep Search for iterative exploration
graph.addEdge({
  from: "deepSearch",
  to: "deepSearch",
  pattern: "revision",
  relationship: "next",
  config: {
    revision: {
      maxIterations: 2,
      stopCondition:
        "Do you believe you now have enough information to craft a comprehensive answer?",
      revisionPrompt: (previousText: string) => {

        return (
          `Previously gathered insights:\n${previousText}\n\n` +
          `Reflect on the information you have gathered and do further search using the search tool and reader tool to find more information to improve the answer.`
        );
      },
    },
  },
});
  
// From Deep Search -> Aggregator
graph.addEdge({
  from: "deepSearch",
  to: "aggregator",
  pattern: "sequential",
  relationship: "next",
});

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

  await graph.execute("initialSearch", data.prompt);
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
