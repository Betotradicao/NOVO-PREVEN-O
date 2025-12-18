import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Força geração de novos nomes de arquivo a cada build para quebrar cache
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3004,
    strictPort: true, // 🔒 NÃO MUDA DE PORTA! Dá erro se 3004 estiver ocupada
    allowedHosts: [
      '.ngrok-free.dev',
      '.ngrok.io',
      'prevencaonoradar.com.br',
      'www.prevencaonoradar.com.br',
      'localhost',
    ],
    // Proxy para encaminhar chamadas /api para o backend na porta 3001
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      usePolling: true,
    },
  },
  optimizeDeps: {
    include: ['react-color'],
  },
})
