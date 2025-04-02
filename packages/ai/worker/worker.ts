import { ChatMode } from '@repo/shared/config';
import { runWorkflow } from '../workflow/flow';
// Create context for the worker
const ctx: Worker = self as any;

// Create a mock process.env object for the worker context
if (typeof process === 'undefined') {
    (self as any).process = { env: {} };
}

// Store for API keys and active workflow
let apiKeys: Record<string, string> = {};
let activeWorkflow: ReturnType<typeof runWorkflow> | null = null;

// Handle messages from the main thread
ctx.addEventListener('message', async (event: MessageEvent) => {
    const { type, payload } = event.data;

    try {
        if (type === 'START_WORKFLOW') {
            // If there's an active workflow, abort it before starting a new one
            if (activeWorkflow) {
                try {
                    activeWorkflow.abort?.(false);
                    activeWorkflow = null;
                } catch (e) {
                    console.error('[Worker] Error aborting previous workflow:', e);
                }
            }

            const {
                mode,
                question,
                threadId,
                threadItemId,
                parentThreadItemId,
                messages,
                config,
                apiKeys: newApiKeys,
                mcpConfig,
            } = payload;

            // Set API keys if provided
            if (newApiKeys) {
                apiKeys = newApiKeys;

                self.AI_API_KEYS = {
                    openai: apiKeys.OPENAI_API_KEY,
                    anthropic: apiKeys.ANTHROPIC_API_KEY,
                    fireworks: apiKeys.FIREWORKS_API_KEY,
                    google: apiKeys.GEMINI_API_KEY,
                    together: apiKeys.TOGETHER_API_KEY,
                };

                self.SERPER_API_KEY = apiKeys.SERPER_API_KEY;
                self.JINA_API_KEY = apiKeys.JINA_API_KEY;
                self.NEXT_PUBLIC_APP_URL = apiKeys.NEXT_PUBLIC_APP_URL;

                console.log('[Worker] Starting workflow with env:', self.AI_API_KEYS);
            }

            // Initialize the workflow
            activeWorkflow = runWorkflow({
                mode,
                question,
                threadId,
                threadItemId,
                messages,
                config,
                mcpConfig,
                onFinish: (data: any) => {},
            });

            // Forward workflow events to the main thread
            activeWorkflow.onAll((event, payload) => {
                console.log('payload', payload);
                ctx.postMessage({
                    event: event,
                    threadId,
                    threadItemId,
                    parentThreadItemId,
                    mode,
                    query: question,
                    [event]: payload,
                });
            });

            // Start the workflow with the appropriate task
            const startTask = mode === ChatMode.Deep ? 'router' : 'router';
            const result = await activeWorkflow.start(startTask, {
                question,
            });

            console.log('result', activeWorkflow.getTimingSummary());

            // Send completion message
            ctx.postMessage({
                type: 'done',
                status: 'complete',
                threadId,
                threadItemId,
                parentThreadItemId,
                result,
            });

            // Clear the active workflow reference
            activeWorkflow = null;
        } else if (type === 'ABORT_WORKFLOW') {
            // Abort handling
            if (activeWorkflow) {
                try {
                    activeWorkflow.abort?.(payload.graceful);
                    activeWorkflow = null;
                } catch (e) {
                    console.error('[Worker] Error aborting workflow:', e);
                }
            }

            ctx.postMessage({
                type: 'done',
                status: 'aborted',
                threadId: payload.threadId,
                threadItemId: payload.threadItemId,
                parentThreadItemId: payload.parentThreadItemId,
            });
        }
    } catch (error) {
        console.error('[Worker] Error in worker:', error);

        ctx.postMessage({
            type: 'done',
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
            threadId: payload?.threadId,
            threadItemId: payload?.threadItemId,
            parentThreadItemId: payload?.parentThreadItemId,
        });

        // Clear the active workflow reference on error
        activeWorkflow = null;
    }
});
