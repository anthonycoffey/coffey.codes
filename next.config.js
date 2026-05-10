const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  transpilePackages: ['next-mdx-remote'],
  experimental: {
    optimizePackageImports: [
      '@heroicons/react',
      'mermaid',
      '@visx/axis',
      '@visx/event',
      '@visx/gradient',
      '@visx/group',
      '@visx/responsive',
      '@visx/scale',
      '@visx/shape',
      '@visx/text',
      '@visx/tooltip',
      '@react-three/drei',
    ],
  },
  async redirects() {
    return [
      {
        source: '/articles/console-log-nested-object-in-javascript',
        destination: '/articles',
        permanent: true,
      },
      {
        source: '/articles/gradient-background-for-post-thumbnails',
        destination: '/articles',
        permanent: true,
      },
      {
        source:
          '/articles/unveiling-nested-objects-enhanced-console-logging-node-js',
        destination: '/articles',
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
        source:
          '/articles/mitigating-risk-reducing-delays-in-ai-software-development-projects',
        destination: '/articles',
        permanent: true,
      },
      {
        source: '/articles/avoiding-unnecessary-re-renders-in-react-apps',
        destination:
          '/articles/preventing-unnecessary-re-renders-in-react-apps',
        permanent: true,
      },
      {
        source: '/articles/using-css-gradients-for-dynamic-post-thumbnails',
        destination: '/articles',
        permanent: true,
      },
    ];
  },
  sassOptions: {
    includePaths: ['styles'],
  },
  async rewrites() {
    return [
      {
        source: '/functions/:path*',
        destination:
          'https://us-central1-coffeywebdev-d0487.cloudfunctions.net/:path*',
        basePath: false,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
