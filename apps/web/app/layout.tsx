import { RootLayout } from '@/components/layout';
import { ReactQueryProvider } from '@/libs/context';
import { AuthProvider } from '@/libs/context/auth';
import { RootProvider } from '@/libs/context/root';
import { TooltipProvider, cn } from '@repo/ui';
import { GeistSans } from 'geist/font/sans';
import type { Viewport } from 'next';
import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';

export const metadata: Metadata = {
  title: 'LLMChat - Your Ultimate AI Chat Experience',
  description: 'Chat with top LLMs in a minimal, privacy-focused UI.',
  keywords: 'AI chat, LLM, language models, privacy, minimal UI, ollama, chatgpt',
  authors: [{ name: 'Trendy design', url: 'https://trendy.design' }],
  creator: 'Trendy design',
  publisher: 'Trendy design',
  openGraph: {
    title: 'LLMChat - Your Ultimate AI Chat Experience',
    siteName: 'llmchat.co',
    description: 'Chat with top LLMs in a minimal, privacy-focused UI.',
    url: 'https://llmchat.co',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://llmchat.co/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LLMChat Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLMChat - Your Ultimate AI Chat Experience',
    site: 'llmchat.co',
    creator: '@llmchat_co',
    description: 'Chat with top LLMs in a minimal, privacy-focused UI.',
    images: ['https://llmchat.co/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://llmchat.co',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function ParentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(GeistSans.className, 'antialiased', 'light')}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          defer
          data-domain="llmchat.co"
          src="https://plausible.io/js/script.tagged-events.js"
        />
      </head>
      <body>
        <RootProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <ReactQueryProvider>
                <AuthProvider>
                  <RootLayout>{children}</RootLayout>
                </AuthProvider>
              </ReactQueryProvider>
            </TooltipProvider>
          </ThemeProvider>
        </RootProvider>
      </body>
    </html>
  );
}
