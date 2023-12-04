/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['components', 'models', 'pages', 'providers', 'utils', 'workers'],
  },
  output: 'export',
};

module.exports = nextConfig;
