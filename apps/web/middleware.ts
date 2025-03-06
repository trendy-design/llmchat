import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

let ratelimit: Ratelimit;

if (process.env.NEXT_PUBLIC_ENABLE_AUTH === 'true') {
  if (!process.env.RATE_LIMIT_REQUESTS || !process.env.RATE_LIMIT_WINDOW) {
    throw new Error('RATE_LIMIT_REQUESTS and RATE_LIMIT_WINDOW must be set');
  }
  ratelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_REQUESTS),
      process.env.RATE_LIMIT_WINDOW as Parameters<typeof Ratelimit.slidingWindow>[1]
    ),
  });
}


const isProtectedRoute = createRouteMatcher(['/chat(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
