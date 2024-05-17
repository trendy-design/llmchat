import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatProvider } from "@/context/chat/provider";
import { FiltersProvider } from "@/context/filters/provider";
import { SettingsProvider } from "@/context/settings/provider";
import type { Metadata } from "next";
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
        <TooltipProvider>
          <SettingsProvider>
            <ChatProvider>
              <FiltersProvider>
                <div className="w-full h-screen flex flex-row bg-[#E9E9EC] dark:bg-zinc-800">
                  {children}
                  <Toaster />
                </div>
              </FiltersProvider>
            </ChatProvider>
          </SettingsProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
