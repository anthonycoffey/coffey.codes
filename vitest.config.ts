import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    exclude: [
      '**/node_modules/**',
      '**/e2e/**',
      '**/*.e2e.{ts,tsx}',
      '**/*.playwright.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['app/**', 'components/**', 'utils/**', 'hooks/**'],
      exclude: [
        '**/*.d.ts',
        '**/layout.tsx',
        '**/loading.tsx',
        '**/not-found.tsx',
        '**/types.ts',
        'app/og/**',
        '**/__tests__/**',
        'e2e/**',
      ],
      thresholds: {
        lines: 40,
        branches: 30,
        functions: 35,
        statements: 40,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
