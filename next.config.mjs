/** @type {import('next').NextConfig} */
const nextConfig = {
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

  //   async rewrites() {
  //     return [
  //       {
  //         source: "/api/anthropic/:path*",
  //         destination: "https://api.anthropic.com/v1/messages",
  //         // Proxy to Backend
  //       },
  //     ];
  //   },
};

export default nextConfig;
