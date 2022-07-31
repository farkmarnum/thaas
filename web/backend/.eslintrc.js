module.exports = {
  env: {
    node: true,
  },
  extends: ['prettier', 'airbnb-base'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',

    indent: 'off',
    'implicit-arrow-linebreak': 'off',
    'operator-linebreak': 'off',
    'max-len': 'off',
    'comma-dangle': 'off',
    'function-paren-newline': 'off',
  },
};
