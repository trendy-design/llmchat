import {
  AgentContextManager,
  AgentEventPayload,
  AgentGraph,
  AgentGraphEvents,
  completionRequestSchema,
  CompletionRequestType
} from "@repo/ai";
import { ToolEnumType } from "@repo/ai/tools";
import { promises as fs } from "fs";
import type { NextRequest } from 'next/server';
import { join } from "path";



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

  // Read prompt files
  const plannerPrompt = await fs.readFile(
    join(process.cwd(), "app/agent2/prompts/planner.md"),
    "utf8"
  );

  const researcherPrompt = await fs.readFile(
    join(process.cwd(), "app/agent2/prompts/researcher.md"),
    "utf8"
  );
  

  const reflectionPrompt = await fs.readFile(
    join(process.cwd(), "app/agent2/prompts/reflection.md"),
    "utf8"
  );

  const summarizerPrompt = await fs.readFile(
    join(process.cwd(), "app/agent2/prompts/summarizer.md"),
    "utf8"
  );
  
  console.log(plannerPrompt);

  // Use the prompts in node definitions
  graph.addNode({
    id: "planner",
    name: "Planner",
    role: "assistant",
    systemPrompt: plannerPrompt,
  });

  graph.addNode({
    id: "reflection",
    name: "Reflection",
    role: "assistant",
    systemPrompt: reflectionPrompt,
  });

  graph.addNode({
    id: "researcher",
    name: "Researcher",
    role: "assistant",
    systemPrompt: researcherPrompt,
    tools: [ToolEnumType.SEARCH, ToolEnumType.READER],
    toolSteps: 6,
  });

  graph.addNode({
    id: "summarizer",
    name: "Summarizer",
    role: "assistant",
    systemPrompt: summarizerPrompt,
  });




// From Initial Search -> Deep Search
graph.addEdge({
  from: "planner",
  to: "reflection",
  pattern: "sequential",
  relationship: "next",
});

// Self-Edge (Revision) on Deep Search for iterative exploration
graph.addEdge({
  from: "reflection",
  to: "researcher",
  pattern: "revision",
  relationship: "next",
  config: {
    revision: {
      maxIterations: 2,
      stopCondition:
        "Do you believe you now have enough information to craft a comprehensive answer?",
      revisionPrompt: (previousText: string) => {
        return `${reflectionPrompt}
        
        --------------------------------------
        Here is the findings so far: 
        ${previousText}`;
      },
    },
  },
});

// From Deep Search -> Aggregator
graph.addEdge({
  from: "researcher",
  to: "summarizer",
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

  await graph.execute("planner", data.prompt);
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
