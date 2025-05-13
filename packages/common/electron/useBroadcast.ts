import { useEffect, useRef } from 'react';

export function makeChannel(name = 'llm-chat'): BroadcastChannel {
    if (typeof BroadcastChannel === 'undefined')
        throw new Error('BroadcastChannel not supported in this renderer');

    return new BroadcastChannel(name);
}

export function useBroadcast<T>(onMsg: (ev: MessageEvent<T>) => void, name?: string) {
    const bcRef = useRef<BroadcastChannel>();

    useEffect(() => {
        const bc = makeChannel(name);
        bcRef.current = bc;
        bc.onmessage = onMsg;

        return () => {
            bc.onmessage = null;
            bc.close();
        };
    }, [name, onMsg]);

    return (data: T) => bcRef.current?.postMessage(data);
}

export type BroadcastMessageEvent<T = unknown> = {
    data: T;
};

export function useBroadcastReceiver<T>(
    onMsg: (ev: BroadcastMessageEvent<T>) => void,
    name?: string
) {
    useEffect(() => {
        const bc = makeChannel(name);
        bc.onmessage = (event: MessageEvent) => {
            onMsg({ data: (event as any).data });
        };
        return () => {
            bc.onmessage = null;
            bc.close();
        };
    }, [name, onMsg]);
}
