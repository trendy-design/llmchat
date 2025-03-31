import { Thread, useChatStore } from '@repo/common/store';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const ThreadNavBar = () => {
    const { threadId: currentThreadId } = useParams();
    const getThread = useChatStore(useShallow(state => state.getThread));
    const [thread, setThread] = useState<Thread | null>(null);
    useEffect(() => {
        getThread(currentThreadId?.toString() ?? '').then(setThread);
    }, [currentThreadId]);
    return (
        <div className="border-border bg-secondary absolute left-0 right-0 top-0 z-[100] flex h-10 w-full flex-row items-center justify-center border-b">
            <p className="line-clamp-1 max-w-xl text-sm font-medium">{thread?.title}</p>
        </div>
    );
};
