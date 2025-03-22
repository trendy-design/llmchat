'use client';
import { ChatInput } from '@/components/chat-input';
import { Flex } from '@repo/ui';


const ChatPage = () => {

        return (

                                <div className='flex flex-row flex-1 overflow-hidden w-full'>
                                        <Flex className="mx-auto h-full pt-48 flex-1 max-w-3xl items-center" direction="col">

                                                <ChatInput showGreeting={true}/>

                                        </Flex>

                                </div>
                
        );
};

export default ChatPage;
