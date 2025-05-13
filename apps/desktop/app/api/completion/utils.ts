import { NextApiRequest } from 'next';

export function sanitizePayloadForJSON(payload: any): any {
    if (payload === null || payload === undefined) {
        return payload;
    }

    if (typeof payload !== 'object') {
        return payload;
    }

    if (Array.isArray(payload)) {
        return payload.map(item => sanitizePayloadForJSON(item));
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(payload)) {
        if (typeof value !== 'function' && typeof value !== 'symbol') {
            sanitized[key] = sanitizePayloadForJSON(value);
        }
    }

    return sanitized;
}

export function getIp(req: Request | NextApiRequest): string | null {
    // Check for x-forwarded-for header
    const forwardedFor =
        req instanceof Request
            ? req.headers.get('x-forwarded-for')
            : req.headers['x-forwarded-for'];

    if (forwardedFor) {
        return Array.isArray(forwardedFor)
            ? forwardedFor[0].trim()
            : forwardedFor.split(',')[0].trim();
    }

    // Check for x-real-ip header
    const realIp = req instanceof Request ? req.headers.get('x-real-ip') : req.headers['x-real-ip'];

    if (realIp) {
        return Array.isArray(realIp) ? realIp[0].trim() : realIp.trim();
    }

    return null;
}
