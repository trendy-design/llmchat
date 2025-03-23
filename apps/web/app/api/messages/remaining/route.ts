import { auth } from '@clerk/nextjs/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const UNAUTHENTICATED_LIMIT = Number(process.env.RATE_LIMIT_UNAUTHENTICATED ?? 10);
const AUTHENTICATED_LIMIT = Number(process.env.RATE_LIMIT_AUTHENTICATED ?? 20);

const rateLimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(AUTHENTICATED_LIMIT, '24 h')
});

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.userId;
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';

  try {
    const ipKey = `ip:${ip}`;
    const { remaining: ipRemaining, reset } = await rateLimit.getRemaining(ipKey);
    
    let effectiveRemaining;
    const usedRequests = AUTHENTICATED_LIMIT - ipRemaining;

    if (userId) {
      effectiveRemaining = ipRemaining;
    } else {
      effectiveRemaining = Math.max(0, UNAUTHENTICATED_LIMIT - usedRequests);
    }

    const maxLimit = userId ? AUTHENTICATED_LIMIT : UNAUTHENTICATED_LIMIT;

    return NextResponse.json({
      remaining: effectiveRemaining,
      maxLimit,
      reset: new Date(reset).toISOString(),
      isAuthenticated: !!userId
    }, {
      headers: {
        'X-RateLimit-Limit': maxLimit.toString(),
        'X-RateLimit-Remaining': effectiveRemaining.toString(),
        'X-RateLimit-Reset': reset.toString()
      }
    });
  } catch (error) {
    console.error('Rate limit check error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch remaining messages' },
      { status: 500 }
    );
  }
} 