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
import { interVar } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLMChat - Most intuitive All-in-one AI chat interface",
  description:
    "LLMChat is advanced AI chat interface with multiple AI models including local models.",
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
    <html lang="en" className={cn(interVar.variable, "antialiased")}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <CSPostHogProvider>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
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
