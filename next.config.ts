import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporary while the Gemini API returns 429 RESOURCE_EXHAUSTED on file
  // attachments. Remove this once Google ships a fix and chat goes back up.
  async redirects() {
    return [
      {
        source: "/chat",
        destination: "/temp-offline",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
