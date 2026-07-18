import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['**/.dump/', '**/.auth/', '**/.pool/', '**/test-results/', '**/playwright-report/']),

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },

  {
    ...playwright.configs['flat/recommended'],

    files: ['**/*.spec.ts', '**/*.test.ts'],

    rules: { ...playwright.configs['flat/recommended'].rules, 'playwright/no-focused-test': 'error', 'playwright/valid-title': 'off' }
  }
]);
