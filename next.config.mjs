import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultCloudRunApiOrigin =
  "https://leadbellus-87102725202.southamerica-east1.run.app";
const apiProxyOrigin = (
  process.env.API_PROXY_ORIGIN || defaultCloudRunApiOrigin
).replace(/\/$/, "");
const enableApiProxy =
  process.env.ENABLE_API_PROXY === "true" || process.env.VERCEL === "1";

if (enableApiProxy && /(^https?:\/\/)?(www\.)?leadbellus\.com\.br/i.test(apiProxyOrigin)) {
  throw new Error(
    "API_PROXY_ORIGIN must point to the Cloud Run origin, not leadbellus.com.br, to avoid an API proxy loop."
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
  allowedDevOrigins: ["127.0.0.1"],
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    if (!enableApiProxy) return [];

    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${apiProxyOrigin}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
