const js = require('@eslint/js');
const globals = require('globals');
const pluginCypress = require('eslint-plugin-cypress');
const prettier = require('eslint-config-prettier');

module.exports = [
  { ignores: ['node_modules/', 'cypress/screenshots/', 'cypress/videos/', 'cypress/downloads/'] },
  js.configs.recommended,
  {
    files: ['*.js'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
  },
  {
    files: ['cypress/**/*.js'],
    ...pluginCypress.configs.recommended,
    languageOptions: {
      ...pluginCypress.configs.recommended.languageOptions,
      sourceType: 'module',
    },
  },
  prettier,
];
