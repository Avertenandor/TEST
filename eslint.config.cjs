const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        // Node globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        // Test globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn'
    }
  },
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'archive/**',
      'тесты/**',
      '**/*.min.js',
      '**/*-backup*',
      '**/*-part-*',
      '**/*-old*',
      '**/*-legacy*',
      'assets/**',
      'public/assets/**',
      '**/vendor/**',
      'test-results/**',
      'playwright-report/**',
      'coverage/**',
      '**/*.d.ts',
      'vite.config.ts'
    ]
  }
];
