import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LLMChat - Your Ultimate AI Chat Experience",
  description: "Chat with top LLMs in a minimal, privacy-focused UI.",
  keywords: "AI chat, LLM, language models, privacy, minimal UI",
  authors: [{ name: "Trendy design", url: "https://trendy.design" }],
  creator: "Trendy design",
  publisher: "Trendy design",
  openGraph: {
    title: "LLMChat - Your Ultimate AI Chat Experience",
    siteName: "llmchat.co",
    description: "Chat with top LLMs in a minimal, privacy-focused UI.",
    url: "https://llmchat.co",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://llmchat.co/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LLMChat Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LLMChat - Your Ultimate AI Chat Experience",
    site: "llmchat.co",
    creator: "@llmchat_co",
    description: "Chat with top LLMs in a minimal, privacy-focused UI.",
    images: ["https://llmchat.co/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://llmchat.co",
  },
};
