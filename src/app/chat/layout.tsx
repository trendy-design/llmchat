import { MainLayout } from "@/components/main-layout";
import { FiltersProvider } from "@/context/filters/provider";

import { BotsProvider } from "@/context/bots/provider";
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
        <BotsProvider>
          <PromptsProvider>
            <MainLayout>{children}</MainLayout>
          </PromptsProvider>
        </BotsProvider>
      </FiltersProvider>
    </ChatProvider>
  );
}
