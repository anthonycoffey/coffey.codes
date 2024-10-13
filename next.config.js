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
  sassOptions: {
    includePaths: ['styles'],
  },
};

module.exports = nextConfig;

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(module.exports, {
  // https://github.com/getsentry/sentry-webpack-plugin#options
  org: 'coffeywebdevcom',
  project: 'coffeycodes',
  silent: !process.env.CI,
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: false,
});
