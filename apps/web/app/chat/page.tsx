'use client';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

const ChatPage = () => {
    const posthog = usePostHog();

    useEffect(() => {
        posthog.capture('$pageview');
    }, []);

    return <></>;
};

export default ChatPage;
