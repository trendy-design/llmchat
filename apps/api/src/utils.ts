import { HonoRequest as Request } from 'hono';

export function sanitizePayloadForJSON(payload: any): any {
	if (payload === null || payload === undefined) {
		return payload;
	}

	if (typeof payload !== 'object') {
		return payload;
	}

	if (Array.isArray(payload)) {
		return payload.map((item) => sanitizePayloadForJSON(item));
	}

	const sanitized: Record<string, any> = {};
	for (const [key, value] of Object.entries(payload)) {
		if (typeof value !== 'function' && typeof value !== 'symbol') {
			sanitized[key] = sanitizePayloadForJSON(value);
		}
	}

	return sanitized;
}

export function getIp(req: Request): string | null {
	// Check for cf-connecting-ip (Cloudflare specific)
	const cfIp = req.header('cf-connecting-ip');
	if (cfIp) {
		return cfIp.trim();
	}

	// Check for x-forwarded-for header
	const forwardedFor = req.header('x-forwarded-for');
	if (forwardedFor) {
		return forwardedFor.split(',')[0].trim();
	}

	// Check for x-real-ip header
	const realIp = req.header('x-real-ip');
	if (realIp) {
		return realIp.trim();
	}

	return null;
}
