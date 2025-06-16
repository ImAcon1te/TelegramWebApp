import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
    })
  ],
  server: {
    allowedHosts: ['https://barnacle-trusted-informally.ngrok-free.app/'],
    proxy: {
      // ловим точный путь /register (POST, GET и т. д.)
      '/register': {
        target: 'http://localhost:80', // порт вашего бэка
        changeOrigin: true,
        secure: false,
      },
      '/user': {
        target: 'http://localhost:80', // порт вашего бэка
        changeOrigin: true,
        secure: false,
      },
      '/regions': {
        target: 'http://localhost:80', // порт вашего бэка
        changeOrigin: true,
        secure: false,
      },
      '/offer': {
        target: 'http://localhost:80', // порт вашего бэка
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
