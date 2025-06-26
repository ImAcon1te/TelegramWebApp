import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const isDocker = (process as any).env.IS_DOCKER === 'true'
// https://vite.dev/config/
export default defineConfig({
  appType: 'spa',
  plugins: [
    react({}),
  ],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    origin: 'https://barnacle-trusted-informally.ngrok-free.app',
    proxy: {
      // ловим точный путь /register (POST, GET и т. д.)
      '/register': {
        target: isDocker ? 'http://flask-app:80' : 'http://localhost:80',
        changeOrigin: true,
        secure: false,
      },
      '/user': {
        target: isDocker ? 'http://flask-app:80' : 'http://localhost:80',
        changeOrigin: true,
        secure: false,
      },
      '/regions': {
        target: isDocker ? 'http://flask-app:80' : 'http://localhost:80',
        changeOrigin: true,
        secure: false,
      },
      '/offer': {
        target: isDocker ? 'http://flask-app:80' : 'http://localhost:80',
        changeOrigin: true,
        secure: false,
      },
      '/offer/create': {
        target: isDocker ? 'http://flask-app:80' : 'http://localhost:80',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  build: {
    outDir: '../static/frontend',
    assetsDir: '',
    rollupOptions: {
      output: {
        entryFileNames: `main.js`,
        chunkFileNames: `[name].[hash].js`,
      }
    }
  }
})
