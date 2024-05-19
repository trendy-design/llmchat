import { MainLayout } from "@/components/main-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatProvider } from "@/context/chat/provider";
import { FiltersProvider } from "@/context/filters/provider";
import { SettingsProvider } from "@/context/settings/provider";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Most intutive all-in-one AI chat client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SettingsProvider>
              <ChatProvider>
                <FiltersProvider>
                  <MainLayout>{children}</MainLayout>
                </FiltersProvider>
              </ChatProvider>
            </SettingsProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
