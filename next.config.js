/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['components', 'models', 'pages', 'providers', 'utils'],
  },
  extends: [
    'next',
    'eslint:recommended',
    'plugin:@next/next/recommended',
  ],
};

module.exports = nextConfig;
