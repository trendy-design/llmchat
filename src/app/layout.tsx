import { MainLayout } from "@/components/layout/main-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  PreferenceProvider,
  ReactQueryProvider,
  SessionsProvider,
} from "@/context"; // Consolidated context imports
import { AuthProvider } from "@/context/auth";
import { cn } from "@/helper/clsx";
import { CSPostHogProvider } from "@/libs/posthog/provider";
import type { Metadata, Viewport } from "next"; // Combined type imports
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import { interVar } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLMChat - Your Ultimate AI Chat Experience",
  description: "Chat with top LLMs in a minimal, privacy-focused UI.",
  openGraph: {
    title: "LLMChat - Your Ultimate AI Chat Experience",
    siteName: "llmchat.co",
    description: "Chat with top LLMs in a minimal, privacy-focused UI.",
    url: "https://llmchat.co",
  },
  twitter: {
    card: "summary_large_image",
    title: "LLMChat - Your Ultimate AI Chat Experience",
    site: "llmchat.co",
    description: "Chat with top LLMs in a minimal, privacy-focused UI.",
  },
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
    <html lang="en" className={cn(interVar.variable, "antialiased", "light")}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <Script
          defer
          data-domain="llmchat.co"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <CSPostHogProvider>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ReactQueryProvider>
              <AuthProvider>
                <TooltipProvider>
                  <PreferenceProvider>
                    <SessionsProvider>
                      <MainLayout>{children}</MainLayout>
                    </SessionsProvider>
                  </PreferenceProvider>
                </TooltipProvider>
              </AuthProvider>
            </ReactQueryProvider>
          </ThemeProvider>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
