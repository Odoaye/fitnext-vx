const configuredBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.BASE_PATH ?? "";
const basePath =
  configuredBasePath === "/"
    ? ""
    : configuredBasePath.replace(/\/+$/, "");

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export",
  // The live preview and production build can run at the same time in this
  // workspace. Keep their generated chunks separate so a build cannot
  // invalidate the development server's module cache.
  distDir: process.env.NODE_ENV === "production" ? ".next-build" : ".next-dev",
  ...(basePath ? { basePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;