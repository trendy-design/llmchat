import { MainLayout } from "@/components/layout/main-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WelcomeMessage } from "@/components/welcome-message";
import {
  PreferenceProvider,
  ReactQueryProvider,
  SessionsProvider,
} from "@/libs/context";
import { AuthProvider } from "@/libs/context/auth";
import { cn } from "@/libs/utils/clsx";
import type { Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { interVar } from "./fonts";
import "./globals.css";
import "./metadata";

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
    <html lang="en" className={cn(interVar.variable, "antialiased", "light")}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          defer
          data-domain="llmchat.co"
          src="https://plausible.io/js/script.tagged-events.js"
        ></script>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <ReactQueryProvider>
              <AuthProvider>
                <PreferenceProvider>
                  <SessionsProvider>
                    <MainLayout>{children}</MainLayout>
                  </SessionsProvider>
                </PreferenceProvider>
              </AuthProvider>
            </ReactQueryProvider>
            <WelcomeMessage />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
