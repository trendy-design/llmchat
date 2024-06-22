import { MainLayout } from "@/components/main-layout";
import { FiltersProvider } from "@/context/filters/provider";

import { AssistantsProvider } from "@/context/assistants/provider";
import { ChatProvider } from "@/context/chat/provider";
import { PromptsProvider } from "@/context/prompts/provider";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChatProvider>
      <FiltersProvider>
        <AssistantsProvider>
          <PromptsProvider>
            <MainLayout>{children}</MainLayout>
          </PromptsProvider>
        </AssistantsProvider>
      </FiltersProvider>
    </ChatProvider>
  );
}
