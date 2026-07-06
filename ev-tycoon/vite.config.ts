import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 5188 },
  build: { outDir: 'dist', assetsInlineLimit: 8192 },
});
