import { MainLayout } from "@/components/layout/main-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  PreferenceProvider,
  ReactQueryProvider,
  SessionsProvider,
} from "@/context"; // Consolidated context imports
import { cn } from "@/helper/clsx";
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
    <html lang="en" className={cn(interVar.variable, "antialiased")}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <TooltipProvider>
              <PreferenceProvider>
                <SessionsProvider>
                  <MainLayout>{children}</MainLayout>
                </SessionsProvider>
              </PreferenceProvider>
            </TooltipProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
