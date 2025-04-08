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
