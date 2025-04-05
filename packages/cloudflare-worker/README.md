# Cloudflare Worker for Workflow Orchestration

This package provides a Cloudflare Worker implementation for running the workflow orchestration system on Cloudflare's edge network. It uses Durable Objects for state persistence, allowing long-running workflows to continue even if the Worker times out.

## Features

- Run workflows on Cloudflare's edge network
- Persist workflow state using Durable Objects
- Stream real-time updates back to clients
- Resume workflows after interruptions
- Support for all workflow tasks from the core orchestrator

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Deployment

```bash
npm run publish
```

## Usage Example

### Client-side usage

```typescript
import { CloudflareWorkflowClient } from '@repo/cloudflare-worker';

// Create a client pointing to your deployed worker
const client = new CloudflareWorkflowClient(
    'https://workflow-orchestrator.your-domain.workers.dev'
);

// Execute a workflow
await client.executeWorkflow({
    workerUrl: 'https://workflow-orchestrator.your-domain.workers.dev',
    workflowId: 'unique-workflow-id',
    question: 'What is the capital of France?',
    mode: 'search',
    threadId: 'thread-123',
    threadItemId: 'item-456',
    messages: [],
    webSearch: true,
    showSuggestions: true,
    onEvent: (event, data) => {
        console.log(`Event ${event}:`, data);
    },
    onAnswer: answer => {
        console.log('Answer update:', answer);
    },
    onFinish: data => {
        console.log('Workflow complete:', data);
    },
});
```

### Modifying flow.ts

To update your existing `flow.ts` to use the Cloudflare Worker:

```typescript
import { CloudflareWorkflowClient } from '@repo/cloudflare-worker';

export const runWorkflowOnCloudflare = async ({
    mcpConfig = {},
    mode,
    question,
    threadId,
    threadItemId,
    messages,
    config = {},
    signal,
    webSearch = false,
    showSuggestions = false,
    onFinish,
}) => {
    const client = new CloudflareWorkflowClient(
        'https://workflow-orchestrator.your-domain.workers.dev'
    );

    let lastAnswer = '';

    await client.executeWorkflow({
        workflowId: threadId,
        question,
        mode,
        threadId,
        threadItemId,
        messages,
        webSearch,
        showSuggestions,
        config,
        onEvent: (event, data) => {
            // Handle various events from the workflow
            console.log(`Event ${event}:`, data);
        },
        onAnswer: answer => {
            // Handle incremental answer updates
            lastAnswer = answer;
        },
        onFinish: data => {
            // Handle workflow completion
            onFinish({
                answer: lastAnswer,
                ...data,
            });
        },
    });
};
```

## Architecture

- `worker.ts` - The Cloudflare Worker entrypoint
- `durableObject.ts` - The Durable Object implementation for workflow state
- `adapter.ts` - Adapter for connecting the orchestrator with Cloudflare
- `persistence.ts` - Storage adapter for Durable Objects
- `workflowPersistence.ts` - Workflow-specific persistence layer
- `client.ts` - Client for interacting with the worker from applications

## Benefits of Using Cloudflare Workers and Durable Objects

1. **Global Distribution**: Your workflows run close to your users, reducing latency
2. **Durability**: Workflow state persists even if a worker times out
3. **Scalability**: Automatically scales with demand
4. **Cost Efficiency**: Pay only for what you use
5. **Real-time Updates**: Stream results back to clients as they happen
