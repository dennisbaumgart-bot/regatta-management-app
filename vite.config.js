import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@queries': path.resolve(__dirname, './src/queries'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@validators': path.resolve(__dirname, './src/validators'),
      '@design': path.resolve(__dirname, './src/design'),
    }
  },
  server: {
    port: 3000,
    open: true
  }
})