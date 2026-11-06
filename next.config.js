/** @type {import('next').NextConfig} */

// GitHub Pages serves the site under /<repo-name>/, set via NEXT_PUBLIC_BASE_PATH.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined

module.exports = {
  reactStrictMode: false,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
}
