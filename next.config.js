/** @type {import('next').NextConfig} */
const WorkerPlugin = require('worker-plugin');

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
  plugins: [
    new WorkerPlugin({
      // use "self" as the global object when receiving hot updates.
      globalObject: 'self',
    }),
  ],
};

module.exports = nextConfig;
