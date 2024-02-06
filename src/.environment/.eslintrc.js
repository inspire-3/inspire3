module.exports = {
  root: true,
  parserOptions: {
    parser: {
      // Script parser for `<script>`
      js: 'espree',
      // Script parser for `<script lang="ts">`
      ts: '@typescript-eslint/parser',
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
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:yaml/recommended',
    'prettier',
  ],
  plugins: ['yaml'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
  overrides: [
    {
      files: ['*.md'],
      parser: 'eslint-plugin-markdownlint/parser',
      extends: ['plugin:markdownlint/recommended'],
      rules: {
        'markdownlint/md001': 'off',
        'markdownlint/md030': 'off',
        'markdownlint/md013': [
          'warn',
          {
            line_length: 100,
            heading_line_length: 120,
            code_blocks: false,
          },
        ],
      },
    },
  ],
}
