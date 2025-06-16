import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // прокидываем свою Babel-настройку
      // babel: {
      //   presets: [
      //     [
      //       // Поддержка JSX (auto runtime)
      //       ['@babel/preset-react', { runtime: 'automatic' }],
      //       // Поддержка TS без удаления enum и другого синтаксиса
      //       ['@babel/preset-typescript', { onlyRemoveTypeImports: false }]
      //     ]
      //   ]
      // }
    })
  ],
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
