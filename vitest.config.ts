import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['react/**', 'node_modules/**', 'dist/**'],
    setupFiles: ['./src/test-setup.ts'],
  },
})
