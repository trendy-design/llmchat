import {
  AgentContextManager,
  AgentEventPayload,
  AgentGraph,
  AgentGraphEvents,
  completionRequestSchema,
  CompletionRequestType,
  GraphEdgeType,
} from '@repo/ai';
import { ToolEnumType } from '@repo/ai/tools';
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

  const plannerNode = {
    id: 'planner',
    name: 'Task Planner',
    role: 'planner',
    enableReasoning: true,
    systemPrompt: `You are a meticulous task planning agent that thoroughly analyzes user questions and problems. Your role is to refine the user's question into 5 thoughtful, clear, and probing questions. These refined questions will guide subsequent steps toward providing a complete and accurate answer.
For example, if the user asks "How can cities become more sustainable while accommodating growing populations?" 
out put should be in following format:
------
<question>What innovative strategies can cities implement to enhance sustainability amid rapid urban growth?</question>
<question>How can urban infrastructure be redesigned to support environmental resilience and meet increasing population demands?</question>
<question>What role do renewable energy and smart technology solutions play in fostering sustainable urban development?</question>
<question>How can cities balance economic growth with environmental protection?</question>
<question>What are the key challenges in implementing sustainable urban development?</question>
------`,
    tools: [],
    toolSteps: 1,
    isStep: true,
    returnOutput: false,
  };

  const researchNode = {
    id: 'research',
    name: 'Research',
    role: 'research',
    enableReasoning: true,
    systemPrompt: `You are a meticulous research assistant. Your task is to review the refined questions from the planner and perform comprehensive web searches for related information. Then, analyze the gathered data using the reader tool.use proper citations and references. `,
    tools: [ToolEnumType.SEARCH, ToolEnumType.READER],
    toolSteps: 4,
    isStep: true,
  };

  const summarizerNode = {
    id: 'summarizer',
    name: 'Summarizer',
    role: 'summarizer',
    systemPrompt: `You are a research and writing assistant. Utilizing the summaries produced by the research tool, generate a thorough and detailed analysis that explores all facets of the research comprehensively. Provide in-depth explanations, multiple perspectives, in form of Report.`,
    tools: [],
    toolSteps: 1,
  };

  const nodes = [plannerNode, researchNode, summarizerNode];
  const edges: GraphEdgeType[] = [
    {
      from: 'planner',
      to: 'research',
      relationship: 'next',
      pattern: 'map',
      config: {
        inputTransform: (question: string) => {
          const regex = /<question>(.*?)<\/question>/g;
          const matches = question.matchAll(regex);
          return Array.from(matches, match => match[1].trim()).map(
            question => `question: ${question}`
          );
        },
        outputTransform: (questions: string[]) => questions.join('\n'),
      },
    },
    {
      from: 'research',
      to: 'summarizer',
      relationship: 'next',
      pattern: 'reduce',
      config: {
        outputTransform: (summaries: string[]) => summaries.join('\n'),
      },
    },
  ];
  nodes.forEach(node => graph.addNode(node));
  edges.forEach(edge => graph.addEdge(edge));

  const eventHandler = (event: AgentEventPayload) => {
    console.log('event', event);
    sendMessage(controller, encoder, {
      threadId: data.threadId,
      threadItemId: data.threadItemId,
      parentThreadItemId: data.parentThreadItemId,
      ...event,
    });
    if (event.status === 'error') {
      events.off('event', eventHandler);
      try {
        controller.close();
      } catch {}
    }
  };

  events.on('event', eventHandler);

  await graph.execute('planner', data.prompt);
  events.off('event', eventHandler);
  try {
    controller.close();
  } catch {}
}

function sendMessage(
  controller: StreamController,
  encoder: TextEncoder,
  payload: AgentEventResponse
) {
  const message = `event: message\ndata: ${JSON.stringify(payload)}\n\n`;
  try {
    controller.enqueue(encoder.encode(message));
  } catch {}
}
