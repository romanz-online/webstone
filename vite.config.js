import { defineConfig } from 'vite'

export default defineConfig({
  root: './public/',
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
    hmr: true,
  },
})
