/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  async redirects() {
    return [
      {
        source: '/articles/console-log-nested-object-in-javascript',
        destination:
          '/articles/unveiling-nested-objects-enhanced-console-logging-node-js',
        permanent: true,
      },
      {
        source: '/articles/gradient-background-for-post-thumbnails',
        destination:
          '/articles/using-css-gradients-for-dynamic-post-thumbnails',
        permanent: true,
      },
      {
        source: '/articles/my-markdown-resume',
        destination: '/articles/markdown-resume',
        permanent: true,
      },
      {
        source:
          '/articles/unveiling-nested-objects-enhanced-console-logging-node-js',
        destination: '/articles/logging-deep-nested-objects-in-nodejs',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'coffeywebdevcom',
  project: 'coffeycodes',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  automaticVercelMonitors: false,
});
