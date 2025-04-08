import { ChatInput } from '@repo/common/components';

export default function ChatPageLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { threadId: string };
}) {
    const { threadId } = params;

    return (
        <div className="relative flex h-full w-full flex-col">
            {children}
            <ChatInput />
        </div>
    );
}
