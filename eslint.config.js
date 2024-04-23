// @ts-check

import eslintPluginMaxParamsNoConstructor from 'eslint-plugin-max-params-no-constructor';
import tseslint from 'typescript-eslint';

import eslint from '@eslint/js';

export default tseslint.config(
  {
    ignores: [
      '**/dist/',
      '**/coverage/',
      '**/test',
      'babel.config.cjs',
      'index.ts',
      'eslint.config.js',
      'tsup.config.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      'eslint-plugin-max-params-no-constructor': eslintPluginMaxParamsNoConstructor,
    },
    rules: {
      // Allow static class
      '@typescript-eslint/no-extraneous-class': 'off',

      // Force explicit return type
      '@typescript-eslint/explicit-function-return-type': 'error',

      // Force explicit member accessibility
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            accessors: 'explicit',
            constructors: 'no-public',
            methods: 'explicit',
            properties: 'explicit',
            parameterProperties: 'explicit',
          },
        },
      ],

      // Limit the number of parameters except for constructors
      'max-params': 'off',
      'eslint-plugin-max-params-no-constructor/max-params-no-constructor': ['error', 3],
    },
  },
);
