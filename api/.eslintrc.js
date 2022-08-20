module.exports = {
  env: {
    node: true,
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'prettier'
  ],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'prettier',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'prettier/prettier': 'error',

    'import/prefer-default-export': 'off',

    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],

    // The aws-sdk package is already installed in AWS Lambda Node runtimes:
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          './src/functions/helpers/s3.ts',
          './src/functions/helpers/ssm.ts', 
        ],
      },
    ],
  },
};
