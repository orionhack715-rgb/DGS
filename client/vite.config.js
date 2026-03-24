import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: true,
    proxy: {
      '/api': { target: 'https://dgs-1.onrender.com', changeOrigin: true, credentials: true },
      '/uploads': { target: 'https://dgs-1.onrender.com', changeOrigin: true },
      '/ws': { target: 'ws:https://dgs-1.onrender.com', ws: true },
    },
  },
})
