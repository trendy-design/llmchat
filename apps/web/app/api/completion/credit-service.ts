import { kv } from '@vercel/kv';

const DAILY_CREDITS = process.env.FREE_CREDITS_LIMIT_REQUESTS
    ? parseInt(process.env.FREE_CREDITS_LIMIT_REQUESTS)
    : 0;

// Lua scripts as named constants
const GET_REMAINING_CREDITS_SCRIPT = `
local key = KEYS[1]
local lastRefillKey = KEYS[2]
local dailyCredits = tonumber(ARGV[1])
local now = ARGV[2]

local lastRefill = redis.call('GET', lastRefillKey)

if lastRefill ~= now then
    redis.call('SET', key, dailyCredits)
    redis.call('SET', lastRefillKey, now)
    return dailyCredits
end

local remaining = redis.call('GET', key)
return remaining or 0
`;

const DEDUCT_CREDITS_SCRIPT = `
local key = KEYS[1]
local cost = tonumber(ARGV[1])

-- Get current credits
local remaining = tonumber(redis.call('GET', key)) or 0

-- Check if enough credits
if remaining < cost then
    return 0
end

-- Deduct credits atomically
redis.call('SET', key, remaining - cost)
return 1
`;

export async function getRemainingCredits(userId: string | null): Promise<number> {
    if (!userId) return 0;

    if (DAILY_CREDITS === 0) {
        return 0;
    }

    try {
        const key = `credits:${userId}`;
        const lastRefillKey = `${key}:lastRefill`;
        const now = new Date().toISOString().split('T')[0];

        // Use atomic operation to check and update if needed
        return await kv.eval(
            GET_REMAINING_CREDITS_SCRIPT,
            [key, lastRefillKey],
            [DAILY_CREDITS.toString(), now]
        );
    } catch (error) {
        console.error('Failed to get remaining credits:', error);
        return 0;
    }
}

export async function deductCredits(userId: string, cost: number): Promise<boolean> {
    if (!userId) return false;

    try {
        const key = `credits:${userId}`;

        // Use atomic operations to prevent race conditions
        return (await kv.eval(DEDUCT_CREDITS_SCRIPT, [key], [cost.toString()])) === 1;
    } catch (error) {
        console.error('Failed to deduct credits:', error);
        return false;
    }
}

export { DAILY_CREDITS };
