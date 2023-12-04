module.exports = {
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        // always try to resolve types under `<root>@types` directory
        // even it doesn't contain any source code, like `@types/unist`
        alwaysTryTypes: true,
      },
    },
  },
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'airbnb',
    'airbnb-typescript',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'next',
    'plugin:@next/next/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    project: true,
    tsconfigRootDir: __dirname,
  },
  overrides: [
    {
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
      files: ['./**/*.cjs', './**/*.js'],
    },
  ],
  plugins: ['import', 'react', '@typescript-eslint'],
  rules: {
    'no-unused-vars': ['error', { args: 'none' }],
    'max-len': ['error', { code: 120 }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'import/no-unresolved': 'error',
    'import/extensions': 'off',
    'react/jsx-filename-extension': [2, { extensions: ['.jsx', '.ts', '.tsx'] }],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'off',
  },
  globals: {
    JSX: true,
  },
};
