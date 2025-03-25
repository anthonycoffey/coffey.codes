import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

const config = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
      'jsx-a11y': jsxA11yPlugin,
      next: nextPlugin,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      // 'no-console': ['warn', { allow: ['warn', 'error'] }],
      // 'react/no-unescaped-entities': 'off', 
      // 'no-useless-escape': 'warn',  
      // '@next/next/no-img-element': 'warn', 
      // '@next/next/no-html-link-for-pages': 'warn', 
      // 'no-constant-binary-expression': 'warn',  
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: ['node_modules', '.next', 'public', '**/*.d.ts', '**/*.mdx'],
  },
];

export default config;
