import { runWorkflow } from '@repo/ai/workflow';
import { CHAT_MODE_CREDIT_COSTS } from '@repo/shared/config';
import { deductCredits } from './credit-service';
import { CompletionRequestType, StreamController } from './types';
import { sanitizePayloadForJSON } from './utils';

export function sendMessage(controller: StreamController, encoder: TextEncoder, payload: any) {
    try {
        // Normalize markdown content if present
        if (payload.content && typeof payload.content === 'string') {
            payload.content = normalizeMarkdownContent(payload.content);
        }

        const sanitizedPayload = sanitizePayloadForJSON(payload);

        // Ensure proper formatting of SSE message with flush
        const message = `event: ${payload.type}\ndata: ${JSON.stringify(sanitizedPayload)}\n\n`;

        // Send the message as a complete unit to avoid partial line issues
        controller.enqueue(encoder.encode(message));
    } catch (error) {
        console.error('Error serializing message payload:', error);
        const errorMessage = `event: done\ndata: ${JSON.stringify({
            type: 'done',
            status: 'error',
            error: 'Failed to serialize payload',
            threadId: payload.threadId,
            threadItemId: payload.threadItemId,
            parentThreadItemId: payload.parentThreadItemId,
        })}\n\n`;
        controller.enqueue(encoder.encode(errorMessage));
    }
}

export function normalizeMarkdownContent(content: string): string {
    // Replace literal "\n" strings with actual line breaks
    // This handles cases where the content contains escaped newlines
    const normalizedContent = content.replace(/\\n/g, '\n');

    return normalizedContent;
}

export async function executeStream(
    controller: StreamController,
    encoder: TextEncoder,
    data: CompletionRequestType,
    abortController: AbortController,
    userId: string
) {
    let success = false; // Track successful completion
    try {
        if (!userId) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const creditCost = CHAT_MODE_CREDIT_COSTS[data.mode];

        const { signal } = abortController;

        const workflow = runWorkflow({
            mode: data.mode,
            question: data.prompt,
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            messages: data.messages,
            webSearch: data.webSearch || false,
            config: {
                maxIterations: data.maxIterations || 3,
                signal,
            },
            mcpConfig: data.mcpConfig || {},
            showSuggestions: data.showSuggestions || false,
            onFinish: async (/* data: any */) => {
                // Removed unused 'data' param
                const deducted = await deductCredits(userId, creditCost); // Renamed variable for clarity
                if (!deducted) {
                    // Consider if this should just log or still throw, depending on desired behavior
                    console.warn(`Failed to deduct ${creditCost} credits for user ${userId}`);
                    // throw new Error('Failed to deduct credits'); // Or handle differently
                }
            },
        });

        workflow.onAll((event, payload) => {
            sendMessage(controller, encoder, {
                type: event,
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
                query: data.prompt,
                mode: data.mode,
                webSearch: data.webSearch || false,
                showSuggestions: data.showSuggestions || false,
                [event]: payload,
            });
        });

        console.log('starting workflow');

        await workflow.start('router', {
            question: data.prompt,
        });

        console.log('workflow completed');

        const timingSummary = workflow.getTimingSummary();
        console.log('timingSummary', timingSummary); // Keep for debugging if needed

        // Mark as successful before sending the final message
        success = true;

        // Send 'done' message here upon successful completion, regardless of timingSummary
        sendMessage(controller, encoder, {
            type: 'done',
            status: 'complete',
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        });

        // No controller.close() here
        return { success: true }; // Indicate success to the caller if needed
    } catch (error) {
        // Error handling remains the same, sending 'aborted' or 'error' status
        if (abortController.signal.aborted) {
            console.log('abortController.signal.aborted');
            sendMessage(controller, encoder, {
                type: 'done',
                status: 'aborted',
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
            });
        } else {
            console.log('sending error message');
            sendMessage(controller, encoder, {
                type: 'done',
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
            });
        }
        // No controller.close() here
        throw error; // Re-throw the error to be caught by the route handler if necessary
    }
    // NOTE: The 'finally' block that was here is removed as closure is handled in route.ts
}
