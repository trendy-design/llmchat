import { DurableObjectState } from '@cloudflare/workers-types';
import { CloudflareWorkflowAdapter } from './adapter';

export class WorkflowDurableObject {
    private state: DurableObjectState;
    private adapter: CloudflareWorkflowAdapter<any, any>;

    constructor(state: DurableObjectState) {
        this.state = state;
        this.adapter = new CloudflareWorkflowAdapter(state);
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // Special execution endpoint
        if (path === '/execute') {
            return await this.executeWorkflow(request);
        }

        // Original persistence endpoints
        const workflowId = path.split('/').pop();
        if (!workflowId) {
            return new Response('Missing workflow ID', { status: 400 });
        }

        // Basic CRUD operations
        if (request.method === 'GET') {
            const exists = await this.adapter.workflowExists(workflowId);
            if (!exists) {
                return new Response('Workflow not found', { status: 404 });
            }

            const data = await this.adapter.loadWorkflow(workflowId);
            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' },
            });
        } else if (request.method === 'POST') {
            const data = await request.json();
            await this.adapter.saveWorkflowState(workflowId, data);
            return new Response('OK', { status: 200 });
        } else if (request.method === 'DELETE') {
            await this.adapter.deleteWorkflow(workflowId);
            return new Response('OK', { status: 200 });
        }

        return new Response('Method not allowed', { status: 405 });
    }

    async executeWorkflow(request: Request): Promise<Response> {
        // Get workflow parameters from request
        const body: any = await request.json();
        const {
            question,
            mode,
            threadId,
            threadItemId,
            messages,
            webSearch,
            showSuggestions,
            config,
        } = body;

        const url = new URL(request.url);
        const initialTask = url.searchParams.get('initialTask') || 'planner';

        // Set up streaming response for real-time updates
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();

        // Create function to handle streaming updates back to client
        const onUpdate = async (data: any) => {
            try {
                await writer.write(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
            } catch (e) {
                console.error('Error writing to stream:', e);
            }
        };

        // Set up "onFinish" callback
        const onFinish = async (data: any) => {
            try {
                await writer.write(
                    new TextEncoder().encode(`data: ${JSON.stringify({ ...data, done: true })}\n\n`)
                );
                await writer.close();
            } catch (e) {
                console.error('Error closing stream:', e);
            }
        };

        // Execute workflow in background
        this.executeWorkflowBackground(threadId, initialTask, {
            question,
            mode,
            threadId,
            threadItemId,
            messages,
            webSearch,
            showSuggestions,
            config,
            onUpdate,
            onFinish,
        });

        // Return streaming response
        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    }

    async executeWorkflowBackground(
        workflowId: string,
        initialTask: string,
        params: any
    ): Promise<void> {
        const {
            question,
            mode,
            threadId,
            threadItemId,
            messages,
            webSearch,
            showSuggestions,
            config,
            onUpdate,
            onFinish,
        } = params;

        try {
            // Create a builder factory for the workflow
            // This will be passed to the adapter
            const builderFactory = () => {
                // Import dynamically to avoid circular references
                const {
                    createContext,
                    createTypedEventEmitter,
                    WorkflowBuilder,
                } = require('@repo/orchestrator');

                // Create typed event emitter
                const events = createTypedEventEmitter({
                    steps: {},
                    toolCalls: [],
                    toolResults: [],
                    answer: {
                        text: '',
                        status: 'PENDING',
                    },
                    sources: [],
                    suggestions: [],
                    object: {},
                    error: {
                        error: '',
                        status: 'PENDING',
                    },
                    status: 'PENDING',
                });

                // Set up update streaming
                events.onAll((eventName: string, data: any) => {
                    onUpdate({ event: eventName, data });
                });

                const context = createContext({
                    mcpConfig: {},
                    question,
                    mode,
                    webSearch,
                    search_queries: [],
                    messages,
                    goals: [],
                    queries: [],
                    steps: [],
                    sources: [],
                    summaries: [],
                    answer: undefined,
                    threadId,
                    threadItemId,
                    showSuggestions,
                    onFinish,
                });

                // Create the workflow builder
                const builder = new WorkflowBuilder(threadId, {
                    initialEventState: events.getAllState(),
                    events,
                    context,
                    config: {
                        maxIterations: 2,
                        timeoutMs: 60000, // Reduced for Workers' time constraints
                        ...config,
                    },
                });

                return builder;
            };

            // Start or resume the workflow
            const workflow = await this.adapter.startWorkflow(
                workflowId,
                builderFactory,
                initialTask,
                { question }
            );

            // The workflow execution will continue in the background
            // with state being persisted in the Durable Object
            // and updates being sent through the stream
        } catch (error) {
            console.error('Workflow execution error:', error);
            onUpdate({
                event: 'error',
                data: { message: (error as Error).message, stack: (error as Error).stack },
            });
            onFinish({ error: (error as Error).message });
        }
    }
}
