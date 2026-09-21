// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    ignores: [
      '.next',
      'dist',
      'node_modules',
      'coverage',
      'next-env.d.ts',
      '**/*.generated.*',
      'src/api/generated/**/*',
      '**/*.config.*',
      '**/*.mjs',
    ],
  },

  eslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },

  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],

      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',

      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/unbound-method': 'off',

      '@typescript-eslint/no-floating-promises': 'error',

    },
  },

  {
    files: ['**/*.{tsx,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },

  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*'],
              message:
                'Features e componentes não devem importar da camada app.',
            },
          ],
        },
      ],
    },
  },

  {
    files: [
      'src/api/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}',
      'src/constants/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/lib/**/*.{ts,tsx}',
      'src/schemas/**/*.{ts,tsx}',
      'src/types/**/*.{ts,tsx}',
    ],

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*'],
              message:
                'Módulos compartilhados (components, hooks, lib, etc) não devem importar de features.',
            },
            {
              group: ['@/app/*'],
              message:
                'Módulos compartilhados não devem importar da camada app.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/features/**/*.{ts,tsx}'],

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*'],
              message:
                'Uma feature não deve importar outra feature. Extraia para uma camada mais externa (components, hooks, lib).',
            },
            {
              group: ['@/app/*'],
              message: 'Features não devem importar da camada app.',
            },
          ],
        },
      ],
    },
  },
];
