import { kv } from '@vercel/kv';

const DAILY_CREDITS = 100;

export async function getRemainingCredits(userId: string | null): Promise<number> {
    if (!userId) return 0;

    try {
        const key = `credits:${userId}`;
        const lastRefill = await kv.get(`${key}:lastRefill`);
        const now = new Date().toISOString().split('T')[0];

        if (lastRefill !== now) {
            await kv.set(key, DAILY_CREDITS);
            await kv.set(`${key}:lastRefill`, now);
            return DAILY_CREDITS;
        }

        const remaining = await kv.get<number>(key);
        return remaining ?? 0;
    } catch (error) {
        console.error('Failed to get remaining credits:', error);
        return 0;
    }
}

export async function deductCredits(userId: string, cost: number): Promise<boolean> {
    if (!userId) return false;

    try {
        const key = `credits:${userId}`;
        const remaining = await getRemainingCredits(userId);

        if (remaining < cost) return false;

        await kv.set(key, remaining - cost);
        return true;
    } catch (error) {
        console.error('Failed to deduct credits:', error);
        return false;
    }
}

export { DAILY_CREDITS };
