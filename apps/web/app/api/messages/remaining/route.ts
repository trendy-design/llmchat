import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { DAILY_CREDITS, getRemainingCredits } from '../../completion/credit-service';

export async function GET(request: NextRequest) {
    const session = await auth();
    const userId = session?.userId;

    try {
        // Get remaining credits for the user
        const remainingCredits = userId ? await getRemainingCredits(userId) : 0;

        console.log('remainingCredits', remainingCredits);

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
