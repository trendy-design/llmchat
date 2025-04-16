import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(
    async (auth, req) => {
        console.log({
            auth,
            req,
        });
        return NextResponse.next();
    },
    {
        debug: true,
        authorizedParties: [
            'http://localhost:3000',
            'https://llmchat.co',
            'https://staging.llmchat.co',
        ],
    }
);

export const config = {
    matcher: [
        '/api/:path*',
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    ],
};
