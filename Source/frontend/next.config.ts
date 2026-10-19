import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// Chỉ bật HSTS / nâng cấp https khi site thật sự chạy https (VPS chạy http://IP thì không bật, tránh hỏng trang)
const isHttpsSite = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api").origin;
  } catch {
    return "";
  }
})();
const GOOGLE_GSI = "https://accounts.google.com/gsi";

// Content-Security-Policy: chỉ cho tải script/khung/kết nối từ những nguồn cần thiết
// (Next.js cần 'unsafe-inline' cho script hydrate; dev cần thêm 'unsafe-eval' cho hot reload)
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} ${GOOGLE_GSI}/client`,
  `style-src 'self' 'unsafe-inline' ${GOOGLE_GSI}/style`,
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin} ${GOOGLE_GSI}/`,
  `frame-src ${GOOGLE_GSI}/`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isHttpsSite ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  ...(isHttpsSite ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;