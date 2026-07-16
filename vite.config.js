import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward /api/* to your teammate's backend during local dev.
      // Update the target once the backend URL is known, or set VITE_API_BASE_URL instead.
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
    globals: true,
  },
})
