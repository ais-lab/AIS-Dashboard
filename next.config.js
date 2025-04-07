/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  redirects: () => {
    return [
      {
        source: "/data-room",
        destination: "/data-room/intro-video",
        permanent: true,
      },
    ]
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    )

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      }
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    config.resolve.alias.canvas = false

    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.vietqr.io",
      },
    ],
  },
}

const withBundleAnalyzer = require("@next/bundle-analyzer")()

const withPWA = require("next-pwa")({
  dest: "public",
})

module.exports = withPWA(
  process.env.ANALYZE === "true" ? withBundleAnalyzer(nextConfig) : nextConfig
)
