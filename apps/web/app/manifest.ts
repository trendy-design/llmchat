import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Deep.new',
        short_name: 'Deep.new',
        description:
            'Deep.new is a modern AI chat client that allows you to chat with AI in a more intuitive way.',
        start_url: '/',
        display: 'standalone',
        background_color: 'hsl(60 20% 99%)',
        theme_color: 'hsl(60 1% 10%)',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-256x256.png',
                sizes: '256x256',
                type: 'image/png',
            },
            {
                src: '/icon-384x384.png',
                sizes: '384x384',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
