import { MainLayout } from "@/components/layout/main-layout";
import {
  AssistantsProvider,
  ChatProvider,
  CommandsProvider,
  PromptsProvider,
} from "@/context";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChatProvider>
      <CommandsProvider>
        <AssistantsProvider>
          <PromptsProvider>
            <MainLayout>{children}</MainLayout>
          </PromptsProvider>
        </AssistantsProvider>
      </CommandsProvider>
    </ChatProvider>
  );
}
