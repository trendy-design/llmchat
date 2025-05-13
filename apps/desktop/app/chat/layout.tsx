import { ChatInput, RootLayout } from '@repo/common/components';

export default function ChatPageLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { threadId: string };
}) {
    return (
        <RootLayout>
            <div className="relative flex h-full w-full flex-col">
                {children}
                <ChatInput />
            </div>
        </RootLayout>
    );
}
