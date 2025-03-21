'use client';
import { ChatInput } from '@/components/chat-input';
import { Flex } from '@repo/ui';


const ChatPage = () => {

        return (
                <div className='flex flex-row h-full w-full'>
                        <div className='flex flex-col w-full gap-2 overflow-y-auto h-[98dvh] border border-border rounded-md my-2 mr-2 bg-background dark:bg-secondary'>
                                <div className='flex flex-row flex-1 overflow-hidden w-full'>
                                        <Flex className="mx-auto h-full pt-48 flex-1 max-w-3xl items-center overflow-hidden" direction="col">

                                                <ChatInput showGreeting={true}/>

                                        </Flex>

                                </div>
                        </div>
                </div>
        );
};

export default ChatPage;
