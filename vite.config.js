import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Falla si el puerto no está disponible
    open: true,
    host: true // Permitir acceso desde otras interfaces
  }
})
