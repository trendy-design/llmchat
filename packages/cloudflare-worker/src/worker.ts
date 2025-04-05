import { DurableObjectNamespace } from '@cloudflare/workers-types';

export interface Env {
    WORKFLOW_DURABLE_OBJECT: DurableObjectNamespace;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // API route for managing workflow state
        if (path.startsWith('/api/workflow/')) {
            const workflowId = path.split('/').pop();
            if (!workflowId) {
                return new Response('Missing workflow ID', { status: 400 });
            }

            // Create an ID from the workflow's unique ID
            const id = env.WORKFLOW_DURABLE_OBJECT.idFromName(workflowId);

            // Get the Durable Object stub for that ID
            const durableObjectStub = env.WORKFLOW_DURABLE_OBJECT.get(id);

            // Forward the request to the Durable Object
            return durableObjectStub.fetch(request as any) as any;
        }

        // Route for starting a new workflow execution
        if (path === '/api/execute-workflow' && request.method === 'POST') {
            try {
                const body: any = await request.json();
                const {
                    workflowId,
                    question,
                    mode,
                    threadId,
                    threadItemId,
                    messages,
                    webSearch,
                    showSuggestions,
                    config,
                } = body;

                if (!workflowId || !question || !threadId) {
                    return new Response('Missing required parameters', { status: 400 });
                }

                // Create an ID from the workflow's unique ID
                const id = env.WORKFLOW_DURABLE_OBJECT.idFromName(workflowId);

                // Get the Durable Object stub for that ID
                const durableObjectStub = env.WORKFLOW_DURABLE_OBJECT.get(id);

                // Forward to a specific execution endpoint on the Durable Object
                const executionRequest = new Request(
                    new URL(`/execute?initialTask=planner`, request.url).toString(),
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            question,
                            mode,
                            threadId,
                            threadItemId,
                            messages,
                            webSearch,
                            showSuggestions,
                            config,
                        }),
                    }
                );

                return durableObjectStub.fetch(executionRequest as any) as any;
            } catch (error) {
                console.error('Error executing workflow:', error);
                return new Response(
                    `Error executing workflow: ${error instanceof Error ? error.message : String(error)}`,
                    {
                        status: 500,
                    }
                );
            }
        }

        return new Response('Not found', { status: 404 });
    },
};
