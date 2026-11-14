const js = require('@eslint/js');
const globals = require('globals');
const pluginCypress = require('eslint-plugin-cypress');
const pluginPlaywright = require('eslint-plugin-playwright');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: [
      'node_modules/',
      'cypress/screenshots/',
      'cypress/videos/',
      'cypress/downloads/',
      'reports/',
      'test-results/',
    ],
  },
  js.configs.recommended,
  {
    files: ['*.js', 'scripts/**/*.js'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
  },
  {
    files: ['cypress/**/*.js', 'shared/**/*.js'],
    ...pluginCypress.configs.recommended,
    languageOptions: {
      ...pluginCypress.configs.recommended.languageOptions,
      sourceType: 'module',
    },
  },
  {
    files: ['playwright/**/*.js'],
    ...pluginPlaywright.configs['flat/recommended'],
    languageOptions: {
      ...pluginPlaywright.configs['flat/recommended'].languageOptions,
      sourceType: 'module',
    },
  },
  prettier,
];
