/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  transpilePackages: ['next-mdx-remote'], // Added here
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
        destination: '/articles/using-css-gradients-for-dynamic-post-thumbnails',
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
      {
        source: '/articles/logging-deep-nested-objects-in-nodejs',
        destination: '/articles',
        permanent: true,
      },
      {
        source: '/articles/my-markdown-resume',
        destination: '/articles',
        permanent: true,
      },
      {
        source: '/articles/whats-new-in-expo-sdk-50',
        destination: '/articles',
        permanent: true,
      },
      {
        source: '/articles/markdown-resume',
        destination: '/articles',
        permanent: true,
      },
      {
        source: '/articles/mitigating-risk-reducing-delays-in-ai-software-development-projects',
        destination: '/articles',
        permanent: true,
      },
    ];
  },
  sassOptions: {
    includePaths: ['styles'],
  },
};

module.exports = nextConfig;
