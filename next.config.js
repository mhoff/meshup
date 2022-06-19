/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['components', 'models', 'pages', 'providers', 'utils'],
  },
};

module.exports = nextConfig;
