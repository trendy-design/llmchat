import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Only protect specific routes
const isProtectedRoute = createRouteMatcher([
    '/api/completion(.*)', // Protect all completion routes
    '/api/messages/remaining(.*)', // Protect all messages remaining routes
]);

const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL];

const corsOptions = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
export default clerkMiddleware(async (auth, req) => {
    const origin = req.headers.get('origin') ?? '';
    const isAllowedOrigin = allowedOrigins.includes(origin);

    console.log('origin', origin);
    console.log('allowedOrigins', allowedOrigins);
    console.log('isAllowedOrigin', isAllowedOrigin);

    if (!isAllowedOrigin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle preflighted requests
    const isPreflight = req.method === 'OPTIONS';

    if (isPreflight) {
        const preflightHeaders = {
            ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
            ...corsOptions,
        };
        return NextResponse.json({}, { headers: preflightHeaders });
    }

    console.log('isProtectedRoute', isProtectedRoute(req));

    if (!isProtectedRoute(req)) return;

    console.log('req.nextUrl.pathname', req.nextUrl.pathname);

    if (req.nextUrl.pathname.startsWith('/api/completion')) {
        console.log('req.nextUrl.pathname', req.nextUrl.pathname);
        const currentUser = await auth();
        const userId = currentUser?.userId;

        // Guest users can't use the API
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        NextResponse.json({
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });

        // Let the route handler handle the credit check and deduction
        return NextResponse.next();
    }

    if (req.nextUrl.pathname.startsWith('/api/messages/remaining')) {
        console.log('req.nextUrl.pathname', req.nextUrl.pathname);
        const currentUser = await auth();
        const userId = currentUser?.userId;

        NextResponse.json({
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });

        return NextResponse.next();
    }
});

export const config = {
    matcher: ['/api/:path*', '/(api|trpc)/:path*'],
};
