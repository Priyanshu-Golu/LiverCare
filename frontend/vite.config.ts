import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { Target } from 'lucide-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port:3000,
    proxy:{
      '/api': 'http://localhost:8000'
    }
  }
})
