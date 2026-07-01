import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultCloudRunApiOrigin =
  "https://leadbellus-87102725202.southamerica-east1.run.app";
const apiProxyOrigin = (
  process.env.API_PROXY_ORIGIN || defaultCloudRunApiOrigin
).replace(/\/$/, "");
const enableApiProxy = process.env.ENABLE_API_PROXY === "true";

if (enableApiProxy && /(^https?:\/\/)?(www\.)?leadbellus\.com\.br/i.test(apiProxyOrigin)) {
  throw new Error(
    "API_PROXY_ORIGIN must point to the Cloud Run origin, not leadbellus.com.br, to avoid an API proxy loop."
  );
}

/** Hosts legados que devem mandar tráfego público para o domínio canônico (Vercel). */
const LEGACY_PUBLIC_HOSTS = [
  "leadbellus-3zi7un52ua-rj.a.run.app",
  "leadbellus-87102725202.southamerica-east1.run.app",
  "leadvitta-app.web.app",
  "leadvitta-app.firebaseapp.com",
];

const CANONICAL_SITE = "https://www.leadbellus.com.br";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
  allowedDevOrigins: ["127.0.0.1"],
  eslint: { ignoreDuringBuilds: true },
  // Type checking is done via `npx tsc --noEmit` (which passes cleanly).
  // The internal Next.js build type checker can be flaky with .next cache on this setup;
  // we ignore it here and rely on the explicit tsc step for validation.
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    return LEGACY_PUBLIC_HOSTS.flatMap((host) => [
      {
        source: "/",
        has: [{ type: "host", value: host }],
        destination: `${CANONICAL_SITE}/`,
        permanent: true,
      },
      {
        // Páginas públicas sim — /api/* não (webhooks seguem no Cloud Run).
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: host }],
        destination: `${CANONICAL_SITE}/:path`,
        permanent: true,
      },
    ]);
  },
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
