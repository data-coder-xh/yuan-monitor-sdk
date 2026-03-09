import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      external: ['react', 'react-dom']
    }
  }
})
