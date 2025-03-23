'use client';
import { ChatInput } from '@/components/chat-input';
import { RecentThreads } from '@/components/recent-threads';
import { Flex } from '@repo/ui';
import Link from 'next/link';

const ChatPage = () => {

        return (

                <div className='flex flex-col flex-1 overflow-hidden w-full'>
                        <Flex className="mx-auto h-full pt-32 flex-1 max-w-3xl items-center" direction="col">

                                <ChatInput showGreeting={true} />
                                <RecentThreads />

                        </Flex>
                        <div className='w-full p-4 flex flex-row items-center justify-center gap-4'>
                                <Link href='https://github.com/repo-ai/repo' className='text-muted-foreground text-xs'>Star us on GitHub</Link>

                                <Link href='/terms' className='text-muted-foreground text-xs'>Terms</Link>
                                <Link href='/privacy' className='text-muted-foreground text-xs'>Privacy</Link>
                        </div>

                </div>

        );
};

export default ChatPage;
