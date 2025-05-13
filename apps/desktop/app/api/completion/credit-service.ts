import { kv } from '@vercel/kv';

const DAILY_CREDITS_AUTH = process.env.FREE_CREDITS_LIMIT_REQUESTS_AUTH
    ? parseInt(process.env.FREE_CREDITS_LIMIT_REQUESTS_AUTH)
    : 0;

const DAILY_CREDITS_IP = process.env.FREE_CREDITS_LIMIT_REQUESTS_IP
    ? parseInt(process.env.FREE_CREDITS_LIMIT_REQUESTS_IP)
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

export type RequestIdentifier = {
    userId?: string;
    ip?: string;
};

export async function getRemainingCredits(identifier: RequestIdentifier): Promise<number> {
    const { userId, ip } = identifier;

    if (userId) {
        return getRemainingCreditsForUser(userId);
    } else if (ip) {
        return getRemainingCreditsForIp(ip);
    }

    return 0;
}

async function getRemainingCreditsForUser(userId: string): Promise<number> {
    if (DAILY_CREDITS_AUTH === 0) {
        return 0;
    }

    try {
        const key = `credits:user:${userId}`;
        const lastRefillKey = `${key}:lastRefill`;
        const now = new Date().toISOString().split('T')[0];

        return await kv.eval(
            GET_REMAINING_CREDITS_SCRIPT,
            [key, lastRefillKey],
            [DAILY_CREDITS_AUTH.toString(), now]
        );
    } catch (error) {
        console.error('Failed to get remaining credits for user:', error);
        return 0;
    }
}

async function getRemainingCreditsForIp(ip: string): Promise<number> {
    if (DAILY_CREDITS_IP === 0) {
        return 0;
    }

    try {
        const key = `credits:ip:${ip}`;
        const lastRefillKey = `${key}:lastRefill`;
        const now = new Date().toISOString().split('T')[0];

        return await kv.eval(
            GET_REMAINING_CREDITS_SCRIPT,
            [key, lastRefillKey],
            [DAILY_CREDITS_IP.toString(), now]
        );
    } catch (error) {
        console.error('Failed to get remaining credits for IP:', error);
        return 0;
    }
}

export async function deductCredits(identifier: RequestIdentifier, cost: number): Promise<boolean> {
    const { userId, ip } = identifier;

    if (userId) {
        return deductCreditsFromUser(userId, cost);
    } else if (ip) {
        return deductCreditsFromIp(ip, cost);
    }

    return false;
}

async function deductCreditsFromUser(userId: string, cost: number): Promise<boolean> {
    try {
        const key = `credits:user:${userId}`;

        return (await kv.eval(DEDUCT_CREDITS_SCRIPT, [key], [cost.toString()])) === 1;
    } catch (error) {
        console.error('Failed to deduct credits from user:', error);
        return false;
    }
}

async function deductCreditsFromIp(ip: string, cost: number): Promise<boolean> {
    try {
        const key = `credits:ip:${ip}`;

        return (await kv.eval(DEDUCT_CREDITS_SCRIPT, [key], [cost.toString()])) === 1;
    } catch (error) {
        console.error('Failed to deduct credits from IP:', error);
        return false;
    }
}

export { DAILY_CREDITS_AUTH, DAILY_CREDITS_IP };
