/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "icon.horse",
      },
      {
        hostname: "icons.duckduckgo.com",
      },
      {
        hostname: "www.google.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/settings/llms",
        destination: "/settings/llms/openai",
      },
      {
        source: "/settings",
        destination: "/settings/common",
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/chat",
        permanent: true,
      },
    ];
  },

  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/anthropic/:path*",
  //       destination: "https://api.anthropic.com/v1/messages",
  //       // Proxy to Backend
  //     },
  //   ];
  // },
};

export default nextConfig;
