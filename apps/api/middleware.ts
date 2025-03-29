import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Only protect specific routes
const isProtectedRoute = createRouteMatcher([
    '/api/completion(.*)', // Protect all completion routes
    '/api/messages/remaining(.*)', // Protect all messages remaining routes
]);

const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL];

export default clerkMiddleware(async (auth, req) => {
    const origin = req.headers.get('origin') ?? '';
    const isAllowedOrigin = allowedOrigins.includes(origin);

    // Handle preflighted requests
    const isPreflight = req.method === 'OPTIONS';

    if (isPreflight) {
        const response = new NextResponse(null, { status: 204 });

        // Set CORS headers for preflight
        response.headers.set(
            'Access-Control-Allow-Origin',
            origin || process.env.NEXT_PUBLIC_APP_URL || '*'
        );
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version'
        );
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Max-Age', '86400');

        return response;
    }

    // Create the response object that will be modified
    const response = NextResponse.next();

    // Add CORS headers to all responses
    response.headers.set(
        'Access-Control-Allow-Origin',
        origin || process.env.NEXT_PUBLIC_APP_URL || '*'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    // For non-protected routes, just return with CORS headers
    if (!isProtectedRoute(req)) {
        return response;
    }

    // Check if the request is from an allowed origin
    if (!isAllowedOrigin) {
        const errorResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        errorResponse.headers.set(
            'Access-Control-Allow-Origin',
            origin || process.env.NEXT_PUBLIC_APP_URL || '*'
        );
        errorResponse.headers.set('Access-Control-Allow-Credentials', 'true');
        return errorResponse;
    }

    // Handle protected routes
    if (req.nextUrl.pathname.startsWith('/api/completion')) {
        const currentUser = await auth();
        const userId = currentUser?.userId;

        // Guest users can't use the API
        if (!userId) {
            const errorResponse = NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
            errorResponse.headers.set(
                'Access-Control-Allow-Origin',
                origin || process.env.NEXT_PUBLIC_APP_URL || '*'
            );
            errorResponse.headers.set('Access-Control-Allow-Credentials', 'true');
            return errorResponse;
        }
    }

    if (req.nextUrl.pathname.startsWith('/api/messages/remaining')) {
        const currentUser = await auth();
        // Any additional logic needed for the messages remaining endpoint
    }

    return response;
});

export const config = {
    matcher: ['/api/:path*', '/(api|trpc)/:path*'],
};
