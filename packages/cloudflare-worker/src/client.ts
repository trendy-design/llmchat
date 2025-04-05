import { ChatMode } from '@repo/shared/config';

export type CloudflareWorkflowOptions = {
    workerUrl: string;
    workflowId: string;
    question: string;
    mode: ChatMode;
    threadId: string;
    threadItemId: string;
    messages: any[];
    webSearch?: boolean;
    showSuggestions?: boolean;
    config?: Record<string, any>;
    onEvent?: (event: string, data: any) => void;
    onAnswer?: (answer: string) => void;
    onFinish?: (data: any) => void;
};

/**
 * A client for executing workflows via the Cloudflare Worker
 */
export class CloudflareWorkflowClient {
    private workerUrl: string;

    constructor(workerUrl: string) {
        this.workerUrl = workerUrl.endsWith('/') ? workerUrl.slice(0, -1) : workerUrl;
    }

    /**
     * Execute a workflow with the given parameters and handle the streaming response
     */
    async executeWorkflow({
        workflowId,
        question,
        mode,
        threadId,
        threadItemId,
        messages,
        webSearch = false,
        showSuggestions = false,
        config = {},
        onEvent,
        onAnswer,
        onFinish,
    }: CloudflareWorkflowOptions): Promise<void> {
        try {
            const response = await fetch(`${this.workerUrl}/api/execute-workflow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    workflowId,
                    question,
                    mode,
                    threadId,
                    threadItemId,
                    messages,
                    webSearch,
                    showSuggestions,
                    config,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to execute workflow: ${response.status} ${response.statusText}`
                );
            }

            if (!response.body) {
                throw new Error('Response body is empty');
            }

            // Process the streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                // Decode the chunk and add it to our buffer
                buffer += decoder.decode(value, { stream: true });

                // Process complete SSE messages in the buffer
                const messages = buffer.split('\n\n');
                buffer = messages.pop() || ''; // The last item might be incomplete

                for (const message of messages) {
                    if (message.trim() === '' || !message.startsWith('data: ')) {
                        continue;
                    }

                    try {
                        const data = JSON.parse(message.substring(6)); // Remove 'data: ' prefix

                        if (data.done) {
                            onFinish?.(data);
                            return;
                        }

                        if (data.event === 'answer' && data.data?.text && onAnswer) {
                            onAnswer(data.data.text);
                        }

                        onEvent?.(data.event, data.data);
                    } catch (e) {
                        console.error('Error parsing SSE message:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Error in workflow execution:', error);
            throw error;
        }
    }
}

/**
 * Example usage in flow.ts:
 *
 * import { CloudflareWorkflowClient } from '@repo/cloudflare-worker';
 *
 * export const runWorkflowOnCloudflare = async ({
 *   mcpConfig = {},
 *   mode,
 *   question,
 *   threadId,
 *   threadItemId,
 *   messages,
 *   config = {},
 *   signal,
 *   webSearch = false,
 *   showSuggestions = false,
 *   onFinish,
 * }) => {
 *   const client = new CloudflareWorkflowClient('https://workflow-orchestrator.your-domain.workers.dev');
 *
 *   let lastAnswer = '';
 *
 *   await client.executeWorkflow({
 *     workflowId: threadId,
 *     question,
 *     mode,
 *     threadId,
 *     threadItemId,
 *     messages,
 *     webSearch,
 *     showSuggestions,
 *     config,
 *     onEvent: (event, data) => {
 *       // Handle various events from the workflow
 *       console.log(`Event ${event}:`, data);
 *     },
 *     onAnswer: (answer) => {
 *       // Handle incremental answer updates
 *       lastAnswer = answer;
 *     },
 *     onFinish: (data) => {
 *       // Handle workflow completion
 *       onFinish({
 *         answer: lastAnswer,
 *         ...data
 *       });
 *     }
 *   });
 * };
 */
