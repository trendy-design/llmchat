'use client';
import { ChatInput } from '@repo/common/components/chat-input/index';
import { RecentThreads } from '@repo/common/components/recent-threads';
import { useChatStore } from '@repo/common/store';
import { Flex } from '@repo/ui';
import Link from 'next/link';

const ChatPage = () => {
    const threads = useChatStore(state => state.threads);
    return (
        <div className="flex w-full flex-1 flex-col overflow-hidden">
            <Flex
                className="mx-auto h-full w-full max-w-3xl flex-1 items-center px-4 pt-32"
                direction="col"
            >
                <ChatInput showGreeting={true} />
                <RecentThreads />
            </Flex>
            <div className="flex w-full flex-row items-center justify-center gap-4 p-4">
                <Link
                    href="https://github.com/repo-ai/repo"
                    className="text-muted-foreground text-xs"
                >
                    Star us on GitHub
                </Link>
                <Link href="/terms" className="text-muted-foreground text-xs">
                    Terms
                </Link>
                <Link href="/privacy" className="text-muted-foreground text-xs">
                    Privacy
                </Link>
            </div>
        </div>
    );
};

export default ChatPage;
