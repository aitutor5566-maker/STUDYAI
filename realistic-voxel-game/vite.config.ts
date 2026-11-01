import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 5199,
    strictPort: true,
    open: false,
    host: '127.0.0.1'
  },
  build: {
    target: 'esnext',
    sourcemap: true
  },
  optimizeDeps: {
    exclude: ['@dimforge/rapier3d-compat']
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts']
  }
});
