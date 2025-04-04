import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { DAILY_CREDITS, getRemainingCredits } from '../../completion/credit-service';

export async function GET(request: NextRequest) {
    const session = await auth();
    const userId = session?.userId;

    try {
        const remainingCredits = userId ? await getRemainingCredits(userId) : 0;
        const resetTime = getNextResetTime();

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
        if (error instanceof TypeError) {
            return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to fetch remaining credits' }, { status: 500 });
    }
}

function getNextResetTime(): number {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return tomorrow.getTime();
}
