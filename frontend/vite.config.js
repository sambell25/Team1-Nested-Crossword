import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    proxy: {
      '/api': {
        target: 'https://crossword-project-backend-9q0w.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api(?=\/|$)/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
  },
})
