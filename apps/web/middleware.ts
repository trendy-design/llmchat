import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Only protect specific routes
const isProtectedRoute = createRouteMatcher([
    '/completion(.*)', // Protect all completion routes
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isProtectedRoute(req)) return;

    if (req.nextUrl.pathname.startsWith('/complet')) {
        const currentUser = await auth();
        const userId = currentUser?.userId;

        // Guest users can't use the API
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Let the route handler handle the credit check and deduction
        return NextResponse.next();
    }
});

export const config = {
    matcher: ['/completion/:path*', '/(api|trpc)/:path*'],
};
