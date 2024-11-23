import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'], // Included jsx and tsx files
    ignores: ['dist/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true, // Enables JSX parsing
        },
      },
      globals: {
        ...globals.browser,
        JSX: true, // Recognizes JSX as a global variable
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin,
      react: reactPlugin, // Added React plugin
      'react-hooks': reactHooksPlugin, // Added React Hooks plugin
    },
    rules: {
      // TypeScript recommended rules
      ...tseslint.configs.recommended.rules,

      // React recommended rules
      ...reactPlugin.configs.recommended.rules,

      // React Hooks recommended rules
      ...reactHooksPlugin.configs.recommended.rules,

      // Prettier rules to disable conflicting ESLint rules
      ...prettierConfig.rules,

      // Custom rules
      'prettier/prettier': 'error', // Ensures Prettier formatting issues are reported by ESLint
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Optional to reduce verbosity
      '@typescript-eslint/no-unused-vars': ['warn'], // Warns on unused variables
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
  },
];
