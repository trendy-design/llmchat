import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import {
    DAILY_CREDITS_AUTH,
    DAILY_CREDITS_IP,
    getRemainingCredits,
} from '../../completion/credit-service';
import { getIp } from '../../completion/utils';

export async function GET(request: NextRequest) {
    const session = await auth();
    const userId = session?.userId ?? undefined;
    const ip = getIp(request);

    if (!ip) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const remainingCredits = await getRemainingCredits({ userId, ip });
        const resetTime = getNextResetTime();

        return NextResponse.json(
            {
                remaining: remainingCredits,
                maxLimit: userId ? DAILY_CREDITS_AUTH : DAILY_CREDITS_IP,
                reset: new Date(resetTime).toISOString(),
                isAuthenticated: !!userId,
            },
            {
                headers: {
                    'X-Credits-Limit': userId
                        ? DAILY_CREDITS_AUTH.toString()
                        : DAILY_CREDITS_IP.toString(),
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
