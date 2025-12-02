import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  server: {
    watch: {
      usePolling: true,   // <-- fuerza monitoreo real
      interval: 100       // <-- refresco rápido
    },
    hmr: {
      overlay: true
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@interfaces': path.resolve(__dirname, 'src/interfaces'),
    },
  },
})
