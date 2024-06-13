import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionsProvider } from "@/context/sessions/provider";
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

import { ConfirmProvider } from "@/context/confirm/provider";
import { PreferenceProvider } from "@/context/preferences/provider";
import { ReactQueryProvider } from "@/context/react-query/provider";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <TooltipProvider>
              <ConfirmProvider>
                <PreferenceProvider>
                  <SessionsProvider>
                    <SettingsProvider>{children}</SettingsProvider>
                  </SessionsProvider>
                </PreferenceProvider>
              </ConfirmProvider>
            </TooltipProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
