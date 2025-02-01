import eslint from '@eslint/js';
import importPlugn from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

// Info for Proper ESLint Config
// https://typescript-eslint.io/getting-started/#step-2-configuration
export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      import: importPlugn
    }
  },

  // configs.recommended,
  {
    rules: {
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          groups: [
            ['type'], // Type imports first
            'builtin', // Node.js built-ins
            'external', // External dependencies
            'internal', // Internal modules
            ['parent', 'sibling', 'index'] // Local imports
          ],
          pathGroups: [
            {
              pattern: '@gladio.ai/**',
              group: 'external', // Treat `@gladio.ai` as external
              position: 'after'
            },
            {
              pattern: '@gladio.ai/**',
              group: 'type', // Separate type imports from `@gladio.ai`
              position: 'before'
            }
          ],
          pathGroupsExcludedImportTypes: ['type'], // Ensure type imports are separated
          alphabetize: {
            order: 'asc', // Alphabetize imports
            caseInsensitive: true
          },
          'newlines-between': 'never' // Enforce newlines between groups
        }
      ]
    }
  },
  {
    rules: {
      'quotes': ['error', 'single'],
      'object-curly-spacing': ['error', 'always'],
      'space-in-parens': ['error', 'never'],
      'comma-dangle': ['error', 'never'],
      'semi': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'indent': ['error', 2],
      'no-console': 'error',
      'object-property-newline': ['error', {
        'allowAllPropertiesOnSameLine': false
      }],
      'object-curly-newline': ['error', {
        'ObjectExpression': {
          'multiline': true,
          'minProperties': 1
        },
        'ObjectPattern': {
          'multiline': true,
          'minProperties': 1
        },
        'ImportDeclaration': 'never',
        'ExportDeclaration': 'never'
      }],
      'no-multiple-empty-lines': ['error', {
        'max': 2,
        'maxEOF': 0
      }],
      'key-spacing': ['error', {
        'beforeColon': false,
        'afterColon': true
      }],
      'comma-spacing': ['error', {
        'before': false,
        'after': true
      }],
      '@typescript-eslint/no-explicit-any': 'off',
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: 'import',
          next: '*'
        },
        {
          blankLine: 'never',
          prev: 'import',
          next: 'import'
        }
      ],
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
        disallowTypeAnnotations: true
      }]
    }
  },
  {
    ignores: ['**/dist', '**/node_modules', '**/.next']
  },
  {
    ignores: ['**/*.cjs', '**/*.mjs', '**/next.config.js']
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx'
      // We don't want to lint .cjs or .mjs files
    ],
    // Override or add rules here
    rules: {}
  }
);
