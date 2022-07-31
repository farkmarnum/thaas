module.exports = {
  env: {
    node: true,
  },
  extends: ['prettier', 'airbnb-base'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
};
