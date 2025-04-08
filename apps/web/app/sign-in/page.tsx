'use client';

import { useSignIn } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types';
import { Button } from '@repo/ui';

export default function OauthSignIn() {
    const { signIn } = useSignIn();

    if (!signIn) return null;

    const signInWith = (strategy: OAuthStrategy) => {
        return signIn
            .authenticateWithRedirect({
                strategy,
                redirectUrl: '/sign-in/sso-callback',
                redirectUrlComplete: '/',
            })
            .then(res => {
                console.log(res);
            })
            .catch((err: any) => {
                // See https://clerk.com/docs/custom-flows/error-handling
                // for more info on error handling
                console.log(err.errors);
                console.error(err, null, 2);
            });
    };

    // Render a button for each supported OAuth provider
    // you want to add to your app. This example uses only Google.
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-gray-500">Sign in with</p>
                <Button onClick={() => signInWith('oauth_google')} rounded="full">
                    Sign in with Google
                </Button>
            </div>
        </div>
    );
}
