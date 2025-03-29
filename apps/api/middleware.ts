import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Create a middleware chain to ensure CORS is always handled first
const withCors = (middleware: any) => {
    return async (req: NextRequest) => {
        // Log request details to Vercel logs
        console.log(`Request: ${req.method} ${req.nextUrl.pathname}`);
        console.log(`Origin: ${req.headers.get('origin')}`);

        const allowedOrigins = [
            process.env.NEXT_PUBLIC_APP_URL,
            'https://deep.new',
            'http://localhost:3000',
        ].filter(Boolean);

        console.log(`Allowed Origins: ${JSON.stringify(allowedOrigins)}`);

        const origin = req.headers.get('origin') || '';
        const isPreflight = req.method === 'OPTIONS';

        // Handle OPTIONS preflight requests immediately
        if (isPreflight) {
            console.log('Handling preflight request');
            return new NextResponse(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                    'Access-Control-Allow-Headers':
                        'Content-Type,Authorization,X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Date,X-Api-Version',
                    'Access-Control-Max-Age': '86400',
                    'Access-Control-Allow-Credentials': 'true',
                },
            });
        }

        // Continue to the next middleware and add CORS to the response
        const response = await middleware(req);

        // Add CORS headers to all responses
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Credentials', 'true');

        console.log(`Response status: ${response.status}`);
        console.log(
            `Response headers: ${JSON.stringify(Object.fromEntries([...response.headers.entries()]))}`
        );

        return response;
    };
};

// Only protect specific routes
const isProtectedRoute = createRouteMatcher(['/api/completion(.*)', '/api/messages/remaining(.*)']);

// Core middleware for auth protection
const authMiddleware = clerkMiddleware(async (auth, req) => {
    // For non-protected routes, just continue
    if (!isProtectedRoute(req)) {
        return NextResponse.next();
    }

    // Handle protected routes
    if (req.nextUrl.pathname.startsWith('/api/completion')) {
        const currentUser = await auth();
        const userId = currentUser?.userId;

        // Guest users can't use the API
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
    }

    if (req.nextUrl.pathname.startsWith('/api/messages/remaining')) {
        const currentUser = await auth();
        // Additional logic if needed
    }

    return NextResponse.next();
});

// Export the middleware with CORS handling
export default withCors(authMiddleware);

export const config = {
    matcher: ['/api/:path*', '/(api|trpc)/:path*'],
};
