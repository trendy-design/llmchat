'use client';
import { ChatInput, Footer } from '@repo/common/components';
import { Flex } from '@repo/ui';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

const ChatPage = () => {
    const posthog = usePostHog();

    useEffect(() => {
        posthog.capture('$pageview');
    }, []);

    return (
        <div className="flex w-full flex-1 flex-col overflow-hidden">
            <Flex
                className="mx-auto h-full w-full max-w-3xl flex-1 items-center justify-center gap-2 px-4"
                direction="col"
            >
                <ChatInput showGreeting={true} />
            </Flex>
            <Footer />
        </div>
    );
};

export default ChatPage;
