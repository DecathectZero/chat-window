// eslint-disable-next-line import/no-extraneous-dependencies
require('ts-node/register/transpile-only');

module.exports = {
  extends: [
    '@voiceflow/eslint-config/frontend',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['prettier', 'react-hooks', '@typescript-eslint'],
  rules: {
    // disabled temporarily by setting as warnings
    'optimize-regex/optimize-regex': 'warn',
    'simple-import-sort/sort': 'warn',
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: 'config/webpack/common',
      },
    },
  },
  overrides: [
    {
      files: [
        '*.story.*',
        '*.unit.*',
        '*.it.*',
        'src/utils/testing/**/*',
        'test/**/*',
        'config/**/*',
        '.storybook/**/*',
      ],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: true,
          },
        ],
        'no-secrets/no-secrets': 'off',
        'xss/no-mixed-html': 'off',
        'react-hooks/rules-of-hooks': 'off',
        'react/display-name': 'off',
        'lodash/prefer-constant': 'off',
        'import/prefer-default-export': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['webpack.config.js', 'config/**/*'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['**/_suite.js', '*.unit.*'],
      rules: {
        'jest/valid-expect': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: ['@voiceflow/eslint-config/typescript'],
      rules: {
        '@typescript-eslint/no-empty-function': ['off'],
        '@typescript-eslint/ban-types': 'off',
        'lines-between-class-members': 'off',
        '@typescript-eslint/no-namespace': 'off',
      },
    },
  ],
};
