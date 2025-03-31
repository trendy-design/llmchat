import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
    transpilePackages: ['next-mdx-remote'],
    images: {
        remotePatterns: [
            { hostname: 'icon.horse' },
            { hostname: 'icons.duckduckgo.com' },
            { hostname: 'www.google.com' },
            { hostname: 'img.clerk.com' },
            { hostname: 'zyqdiwxgffuy8ymd.public.blob.vercel-storage.com' },
        ],
    },
    experimental: {
        optimizePackageImports: ['shiki'],
        externalDir: true,
    },
    webpack: (config, options) => {
        if (!options.isServer) {
            config.resolve.fallback = { fs: false, module: false, path: false };
        }

        // Existing SQL loader configuration
        config.module.rules.push({
            test: /\.sql$/,
            use: 'raw-loader',
        });

        // Experimental features
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
            layers: true,
        };

        return config;
    },
    // Existing rewrites and redirects
    async rewrites() {
        return [
            { source: '/settings/llms', destination: '/settings/llms/openai' },
            { source: '/settings', destination: '/settings/common' },
        ];
    },
    async redirects() {
        return [{ source: '/', destination: '/chat', permanent: true }];
    },
};

export default withSentryConfig(nextConfig, {
    // Sentry configuration (unchanged)
    org: 'saascollect',
    project: 'javascript-nextjs',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
});
