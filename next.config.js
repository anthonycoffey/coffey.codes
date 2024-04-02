/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  pageExtensions: ["ts", "tsx", "mdx"],
  async redirects() {
    return [
      {
        source: "/articles/console-log-nested-object-in-javascript",
        destination:
          "/articles/unveiling-nested-objects-enhanced-console-logging-node-js",
        permanent: true,
      },
      {
        source: "/articles/gradient-background-for-post-thumbnails",
        destination:
          "/articles/using-css-gradients-for-dynamic-post-thumbnails",
        permanent: true,
      },
      // Add more redirects here
    ];
  },
};

const withMDX = require("./mdx-loader")();
module.exports = withMDX(nextConfig);
