import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ConfirmProvider,
  PreferenceProvider,
  ReactQueryProvider,
  SessionsProvider,
  SettingsProvider,
} from "@/context"; // Consolidated context imports
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next"; // Combined type imports
import { ThemeProvider } from "next-themes";
import { interVar } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Most intutive all-in-one AI chat client",
};

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
      <body className={cn(`${interVar.variable} font-sans`, "antialiased")}>
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
