module.exports = {
  env: {
    node: true,
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb/base',
    'airbnb-typescript/base',
    'prettier',
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'prettier/prettier': 'error',

    // indent: 'off',
    // 'implicit-arrow-linebreak': 'off',
    // 'operator-linebreak': 'off',
    // 'max-len': 'off',
    // 'comma-dangle': 'off',
    // 'function-paren-newline': 'off',

    'prefer-default-export': 'off',
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
  },
};
