import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const content = fileURLToPath(new URL('../03_content/data', import.meta.url));

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: { alias: { '@content': content } },
  server: { fs: { allow: ['..'] } },
  build: { target: 'es2022', assetsInlineLimit: 0 },
  test: { environment: 'node', include: ['src/**/*.test.ts', '../03_content/**/*.test.ts'] },
});
