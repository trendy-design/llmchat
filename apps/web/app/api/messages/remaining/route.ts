import { auth } from '@clerk/nextjs/server';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

// Daily credit allowance
const DAILY_CREDITS = 100;

// Function to get remaining credits
async function getRemainingCredits(userId: string | null): Promise<number> {
    if (!userId) return 0;

    const key = `credits:${userId}`;
    const lastRefill = await kv.get(`${key}:lastRefill`);
    const now = new Date().toISOString().split('T')[0]; // Current date YYYY-MM-DD

    // If it's a new day, refill credits
    if (lastRefill !== now) {
        await kv.set(key, DAILY_CREDITS);
        await kv.set(`${key}:lastRefill`, now);
        return DAILY_CREDITS;
    }

    // Get remaining credits
    const remaining = await kv.get<number>(key);
    return remaining ?? 0;
}

export async function GET(request: NextRequest) {
    const session = await auth();
    const userId = session?.userId;

    try {
        // Get remaining credits for the user
        const remainingCredits = userId ? await getRemainingCredits(userId) : 0;

        // Calculate when credits will reset (next day)
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const resetTime = tomorrow.getTime();

        return NextResponse.json(
            {
                remaining: remainingCredits,
                maxLimit: DAILY_CREDITS,
                reset: new Date(resetTime).toISOString(),
                isAuthenticated: !!userId,
            },
            {
                headers: {
                    'X-Credits-Limit': DAILY_CREDITS.toString(),
                    'X-Credits-Remaining': remainingCredits.toString(),
                    'X-Credits-Reset': resetTime.toString(),
                },
            }
        );
    } catch (error) {
        console.error('Credit check error:', error);
        return NextResponse.json({ error: 'Failed to fetch remaining credits' }, { status: 500 });
    }
}
