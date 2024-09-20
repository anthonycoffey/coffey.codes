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
    ];
  },
};

module.exports = nextConfig;
