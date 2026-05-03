import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import dts from 'vite-plugin-dts'

const external = ['solid-js', 'solid-js/web', 'solid-js/store', 'clsx']

export default defineConfig({
  plugins: [
    solid(),
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.json',
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/__tests__/**',
        'src/dev.tsx',
        'src/test-setup.ts',
      ],
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: (id) =>
        external.some((pkg) => id === pkg || id.startsWith(`${pkg}/`)),
      output: {
        dir: 'dist',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
