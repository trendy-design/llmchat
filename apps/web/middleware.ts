import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Only protect specific routes
const isProtectedRoute = createRouteMatcher([
    '/api/(.*)', // Protect all completion routes
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isProtectedRoute(req)) return;

    if (req.nextUrl.pathname.startsWith('/api')) {
        const currentUser = await auth();
        const userId = currentUser?.userId;

        // Guest users can't use the API
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        // Let the route handler handle the credit check and deduction
        return NextResponse.next();
    }
    return NextResponse.next();
});

export const config = {
    matcher: [
        '/api/:path*',
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    ],
};
