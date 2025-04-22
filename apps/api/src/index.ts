import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { MCPToolManager } from '@repo/ai/tools';
import { runWorkflow, WorkflowContextSchema } from '@repo/ai/workflow';
import { PersistenceLayer } from '@repo/orchestrator';
import { CHAT_MODE_CREDIT_COSTS, ChatMode, ChatModeConfig } from '@repo/shared/config';
import { WorkflowEventSchema } from '@repo/shared/types';
import { DurableObject } from 'cloudflare:workers';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { DAILY_CREDITS_AUTH, DAILY_CREDITS_IP, deductCredits, getRemainingCredits } from './credit-service';
import { completionRequestSchema } from './types';
import { getIp, sanitizePayloadForJSON } from './utils';

type MessagePayload = Record<string, any>;

function sendMessage(controller: ReadableStreamDefaultController, encoder: TextEncoder, payload: MessagePayload) {
	try {
		const sanitizedPayload = sanitizePayloadForJSON(payload);
		const message = `event: ${payload.type}\ndata: ${JSON.stringify(sanitizedPayload)}\n\n`;
		controller.enqueue(encoder.encode(message));
		controller.enqueue(new Uint8Array(0)); // Flush
	} catch (error) {
		const errorMessage = `event: done\ndata: ${JSON.stringify({
			type: 'done',
			status: 'error',
			error: 'Failed to serialize payload',
		})}\n\n`;
		controller.enqueue(encoder.encode(errorMessage));
	}
}

/** A Durable Object's behavior is defined in an exported Javascript class */
export class WorkflowStateObject extends DurableObject<Env> {
	/**
	 * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
	 * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
	 *
	 * @param ctx - The interface for interacting with Durable Object state
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 */
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	// Only handle state persistence methods
	async saveState(id: string, data: any): Promise<void> {
		console.log('saveState', id, data);
		await this.ctx.storage.put(id, data);
	}

	async loadState(id: string): Promise<any> {
		return await this.ctx.storage.get(id);
	}

	async deleteState(id: string): Promise<void> {
		await this.ctx.storage.delete(id);
	}

	async stateExists(id: string): Promise<boolean> {
		return (await this.ctx.storage.get(id)) !== null;
	}
}

const app = new Hono<{ Bindings: Env }>();

// Configure CORS with specific origin and credentials support
app.use(
	cors({
		origin: ['http://localhost:3000', 'https://staging.llmchat.co', 'https://llmchat.co'], // Specify exact origins instead of wildcard
		allowMethods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization'],
		credentials: true, // Important for credentials: 'include'
		maxAge: 86400,
	}),
);

// Add Clerk middleware AFTER CORS middleware
// But exclude OPTIONS requests from auth check
app.use('*', async (c, next) => {
	if (c.req.method === 'OPTIONS') {
		return next();
	}
	return clerkMiddleware()(c, next);
});

app.post('/', async (c) => {
	try {
		// Get authentication info from Clerk
		// Skip auth check during OPTIONS requests
		if (c.req.method == 'OPTIONS') {
			return c.json(
				{
					message: 'Options request',
				},
				200,
			);
		}
		const auth = getAuth(c);
		const userId = auth?.userId;

		// Get IP address
		const ip = getIp(c.req);

		if (!ip && !userId) {
			return c.json(
				{
					error: 'Unauthorized',
					message: 'Unable to identify request origin',
				},
				401,
			);
		}

		const parsed = await c.req.json().catch(() => ({}));
		const validatedBody = completionRequestSchema.safeParse(parsed);

		if (!validatedBody.success) {
			return c.json(
				{
					error: 'Invalid request body',
					details: validatedBody.error.format(),
				},
				400,
			);
		}

		console.log('validatedBody', validatedBody.data);

		const uniqueId = validatedBody.data.threadItemId || crypto.randomUUID();
		console.log('durable object id', uniqueId);
		const id = c.env.WORKFLOW_STATE.idFromName(uniqueId);
		const stateObject = c.env.WORKFLOW_STATE.get(id);
		console.log('stateObject', stateObject);

		// Get credit cost for the selected mode
		const creditCost = CHAT_MODE_CREDIT_COSTS[validatedBody.data.mode];

		// Check if mode requires authentication
		if (!!ChatModeConfig[validatedBody.data.mode]?.isAuthRequired && !userId) {
			return c.json(
				{
					error: 'Authentication required',
					message: 'You must be logged in to use this mode',
				},
				401,
			);
		}

		// Check remaining credits
		const remainingCredits = await getRemainingCredits({
			userId: userId ?? undefined,
			ip: ip ?? undefined,
		});

		console.log('remainingCredits', remainingCredits);
		// Check if user has enough credits
		if (remainingCredits < creditCost && process.env.NODE_ENV !== 'development') {
			return c.json(
				{
					error: 'Rate limit exceeded',
					message: 'You have reached the daily limit of requests. Please try again tomorrow or use your own API key.',
				},
				429,
			);
		}

		const encoder = new TextEncoder();
		const abortController = new AbortController();

		c.req.raw.signal.addEventListener('abort', () => {
			abortController.abort();
		});

		const stream = new ReadableStream({
			async start(controller) {
				const heartbeatInterval = setInterval(() => {
					controller.enqueue(encoder.encode(': heartbeat\n\n'));
				}, 30000);

				let success = false;

				try {
					const persistence = new PersistenceLayer<WorkflowEventSchema, WorkflowContextSchema>({
						save: async (id, data) => stateObject.saveState(id, data),
						// @ts-ignore
						load: async (id) => stateObject.loadState(id) as any,
						delete: async (id) => stateObject.deleteState(id),
						exists: async (id) => stateObject.stateExists(id),
					});

					let mcpToolManager: MCPToolManager | undefined;
					if (Object.keys(validatedBody.data.mcpConfig ?? {}).length > 0 && validatedBody.data.mode === ChatMode.Agent) {
						try {
							mcpToolManager = await MCPToolManager.create(validatedBody.data.mcpConfig as any);
							console.log('MCPToolManager initialized successfully at workflow start');
						} catch (error) {
							console.error('Failed to initialize MCPToolManager:', error);
						}
					}

					const workflow = await runWorkflow({
						mode: validatedBody.data.mode || ChatMode.Deep,
						question: validatedBody.data.prompt || 'Recent AI news',
						threadId: validatedBody.data.threadId || crypto.randomUUID(),
						threadItemId: validatedBody.data.threadItemId || crypto.randomUUID(),
						messages: validatedBody.data.messages || [{ role: 'user', content: validatedBody.data.prompt || 'Recent AI news' }],
						customInstructions:
							validatedBody.data.customInstructions || 'You are a helpful assistant that can answer questions and help with tasks.',
						webSearch: validatedBody.data.webSearch || false,
						config: {
							maxIterations: validatedBody.data.maxIterations || 3,
							signal: abortController.signal,
						},
						showSuggestions: validatedBody.data.showSuggestions || false,
						persistence: persistence,
						mcpToolManager,
					});

					workflow.onAll((event: any, payload: any) => {
						const message = `event: ${event}\ndata: ${JSON.stringify({
							type: event,
							threadId: validatedBody.data.threadId,
							threadItemId: validatedBody.data.threadItemId,
							query: validatedBody.data.prompt,
							mode: validatedBody.data.mode,
							webSearch: validatedBody.data.webSearch || false,
							showSuggestions: validatedBody.data.showSuggestions || false,

							[event]: payload,
						})}\n\n`;
						controller.enqueue(encoder.encode(message));
					});

					if (validatedBody.data.breakpointId) {
						await workflow.resume(validatedBody.data.breakpointId, {
							mcpToolManager,
						});
					} else {
						await workflow.start('router', {
							question: validatedBody.data.prompt,
						});
					}

					success = true;

					const doneMessage = `event: done\ndata: ${JSON.stringify({
						type: 'done',
						status: 'complete',
						threadId: validatedBody.data.threadId,
						threadItemId: validatedBody.data.threadItemId,
					})}\n\n`;
					controller.enqueue(encoder.encode(doneMessage));
				} catch (error) {
					const errorMessage = `event: done\ndata: ${JSON.stringify({
						type: 'done',
						status: abortController.signal.aborted ? 'aborted' : 'error',
						error: error instanceof Error ? error.message : String(error),
						threadId: validatedBody.data.threadId,
						threadItemId: validatedBody.data.threadItemId,
					})}\n\n`;
					controller.enqueue(encoder.encode(errorMessage));
				} finally {
					clearInterval(heartbeatInterval);
					controller.close();

					// Deduct credits after successful completion
					if (success && process.env.NODE_ENV !== 'development') {
						await deductCredits(
							{
								userId: userId ?? undefined,
								ip: ip ?? undefined,
							},
							creditCost,
						);
					}
				}
			},
			cancel() {
				abortController.abort();
			},
		});

		const headers = {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Credits-Available': remainingCredits.toString(),
			'X-Credits-Cost': creditCost.toString(),
			'X-Credits-Daily-Allowance': userId ? DAILY_CREDITS_AUTH.toString() : DAILY_CREDITS_IP.toString(),
		};

		return new Response(stream, { headers });
	} catch (e) {
		return c.json({ error: 'Internal server error' }, 500);
	}
});

export default app;
