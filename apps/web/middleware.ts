import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const UNAUTHENTICATED_LIMIT = Number(process.env.RATE_LIMIT_UNAUTHENTICATED ?? 10);
const AUTHENTICATED_LIMIT = Number(process.env.RATE_LIMIT_AUTHENTICATED ?? 20);

const rateLimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(AUTHENTICATED_LIMIT, '24 h')
});

// Only protect completion routes
const isProtectedRoute = createRouteMatcher([
  '/complet(.*)' // Only protect completion routes
])

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  if (req.nextUrl.pathname.startsWith('/complet')) {
    const currentUser = await auth();
    const userId = currentUser?.userId;
    const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? 'anonymous';
    
    try {
      const ipKey = `ip:${ip}`;
      const { success: ipSuccess, remaining: ipRemaining } = await rateLimit.limit(ipKey);
      
      let effectiveRemaining;
      const usedRequests = AUTHENTICATED_LIMIT - ipRemaining;

      if (userId) {
        effectiveRemaining = ipRemaining;
      } else {
        effectiveRemaining = Math.max(0, UNAUTHENTICATED_LIMIT - usedRequests);
      }

      const maxLimit = userId ? AUTHENTICATED_LIMIT : UNAUTHENTICATED_LIMIT;

      if (!ipSuccess || effectiveRemaining <= 0) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            remaining: 0,
            limit: maxLimit
          },
          { status: 429 }
        );
      }

      const headers = {
        'X-RateLimit-Limit': maxLimit.toString(),
        'X-RateLimit-Remaining': effectiveRemaining.toString(),
        'X-RateLimit-Reset': (Date.now() + 24 * 60 * 60 * 1000).toString()
      };

      // Modify the request to include rate limit headers
      const response = NextResponse.next();
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;

    } catch (error) {
      return NextResponse.json(
        { error: 'Rate limiting error' },
        { status: 500 }
      );
    }
  }
})

export const config = {
  matcher: [
    '/complet/:path*',
    '/(api|trpc)/:path*'
  ]
}
