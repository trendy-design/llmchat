import { auth } from '@clerk/nextjs/server';
import { CHAT_MODE_CREDIT_COSTS } from '@repo/shared/config';
import { Geo, geolocation } from '@vercel/functions';
import { NextRequest } from 'next/server';
import { DAILY_CREDITS, getRemainingCredits } from './credit-service';
import { executeStream, sendMessage } from './stream-handlers';
import { completionRequestSchema, SSE_HEADERS } from './types';

export async function POST(request: NextRequest) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: SSE_HEADERS });
    }

    try {
        const session = await auth();
        const userId = session.userId;

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const parsed = await request.json().catch(() => ({}));
        const validatedBody = completionRequestSchema.safeParse(parsed);

        if (!validatedBody.success) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid request body',
                    details: validatedBody.error.format(),
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { data } = validatedBody;
        const creditCost = CHAT_MODE_CREDIT_COSTS[data.mode];
        const remainingCredits = await getRemainingCredits(userId);

        if (
            remainingCredits < creditCost &&
            process.env.NODE_ENV !== 'development' &&
            session.userId === ''
        ) {
            return new Response(
                'You have reached the daily limit of requests. Please try again tomorrow or Use your own API key.',
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const enhancedHeaders = {
            ...SSE_HEADERS,
            'X-Credits-Available': remainingCredits.toString(),
            'X-Credits-Cost': creditCost.toString(),
            'X-Credits-Daily-Allowance': DAILY_CREDITS.toString(),
        };

        const encoder = new TextEncoder();
        const abortController = new AbortController();

        request.signal.addEventListener('abort', () => {
            abortController.abort();
        });

        const gl = geolocation(request);

        console.log('gl', gl);

        const stream = createCompletionStream(data, userId, abortController, gl);

        return new Response(stream, { headers: enhancedHeaders });
    } catch (error) {
        console.error('Error in POST handler:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

function createCompletionStream(
    data: any,
    userId: string,
    abortController: AbortController,
    gl: Geo
) {
    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            let heartbeatInterval: NodeJS.Timeout | null = null;

            heartbeatInterval = setInterval(() => {
                controller.enqueue(encoder.encode(': heartbeat\n\n'));
            }, 15000);

            try {
                await executeStream(controller, encoder, data, abortController, userId, gl);
            } catch (error) {
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
            } finally {
                if (heartbeatInterval) {
                    clearInterval(heartbeatInterval);
                }
                controller.close();
            }
        },
        cancel() {
            console.log('cancelling stream');
            abortController.abort();
        },
    });
}
