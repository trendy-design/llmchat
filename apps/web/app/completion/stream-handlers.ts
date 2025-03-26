import { runWorkflow } from '@repo/ai';
import { CompletionRequestType, StreamController } from './types';
import { sanitizePayloadForJSON } from './utils';

export function sendMessage(controller: StreamController, encoder: TextEncoder, payload: any) {
    try {
        // Normalize markdown content if present
        if (payload.content && typeof payload.content === 'string') {
            payload.content = normalizeMarkdownContent(payload.content);
        }

        const sanitizedPayload = sanitizePayloadForJSON(payload);
        const message = `event: ${payload.type}\ndata: ${JSON.stringify(sanitizedPayload)}\n\n`;
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
    abortController: AbortController
) {
    try {
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
        });

        workflow.on('flow', payload => {
            sendMessage(controller, encoder, {
                type: 'message',
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
                ...payload,
            });
        });

        const result = await workflow.start('router', {
            question: data.prompt,
        });

        const timingSummary = workflow.getTimingSummary();

        sendMessage(controller, encoder, {
            type: 'done',
            status: 'complete',
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
            result,
        });

        controller.close();
        return result;
    } catch (error) {
        if (abortController.signal.aborted) {
            sendMessage(controller, encoder, {
                type: 'done',
                status: 'aborted',
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
            });
        } else {
            sendMessage(controller, encoder, {
                type: 'done',
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
            });
        }
        controller.close();
        throw error;
    }
}
