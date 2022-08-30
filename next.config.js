/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['components', 'models', 'pages', 'providers', 'utils', 'workers'],
  },
  extends: [
    'next',
    'eslint:recommended',
    'plugin:@next/next/recommended',
  ],
  plugins: [],
};

module.exports = nextConfig;
