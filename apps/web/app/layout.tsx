import { ClerkProvider } from '@clerk/nextjs';
import { RootLayout } from '@repo/common/components';
import { ReactQueryProvider, RootProvider } from '@repo/common/context';
import { TooltipProvider, cn } from '@repo/ui';
import { GeistMono } from 'geist/font/mono';
import type { Viewport } from 'next';
import { Metadata } from 'next';
import localFont from 'next/font/local';

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

const inter = localFont({
    src: './InterVariable.woff2',
    variable: '--font-inter',
});

const cabinet = localFont({
    src: './CabinetGrotesk-Variable.woff2',
    variable: '--font-cabinet',
});

export default function ParentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={cn(GeistMono.variable, inter.variable, cabinet.variable)}
            suppressHydrationWarning
        >
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                {/* <script
                    crossOrigin="anonymous"
                    src="//unpkg.com/react-scan/dist/auto.global.js"
                ></script> */}
            </head>
            <body>
                <ClerkProvider>
                    <RootProvider>
                        {/* <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          > */}
                        <TooltipProvider>
                            <ReactQueryProvider>
                                <RootLayout>{children}</RootLayout>
                            </ReactQueryProvider>
                        </TooltipProvider>
                        {/* </ThemeProvider> */}
                    </RootProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
