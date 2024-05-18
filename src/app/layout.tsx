import { MainLayout } from "@/components/main-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatProvider } from "@/context/chat/provider";
import { FiltersProvider } from "@/context/filters/provider";
import { SettingsProvider } from "@/context/settings/provider";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ThemeProvider attribute="class">
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
