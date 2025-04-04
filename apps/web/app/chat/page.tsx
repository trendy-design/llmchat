'use client';
import { ChatInput, Footer } from '@repo/common/components';
import { Flex } from '@repo/ui';

const ChatPage = () => {
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
