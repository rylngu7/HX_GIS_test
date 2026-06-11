import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    sourcemap: 'hidden',
  },
  server: {
    port: 5175,
    host: '0.0.0.0',
    strictPort: false,
    watch: {
      ignored: ['**/.pnpm-store/**', '**/node_modules/**'],
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
  ],
})
