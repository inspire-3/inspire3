module.exports = {
  root: true,
  parserOptions: {
    parser: {
      // Script parser for `<script>`
      js: 'espree',
    },
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:json/recommended',
    'plugin:yaml/recommended',
    'prettier',
  ],
  plugins: ['yaml'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
}
