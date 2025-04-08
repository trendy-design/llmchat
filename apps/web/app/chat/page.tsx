'use client';
import { plausible } from '@repo/shared/utils';
import { useEffect } from 'react';

const ChatPage = () => {
    useEffect(() => {
        plausible.trackPageview();
    }, []);
    return <></>;
};

export default ChatPage;
