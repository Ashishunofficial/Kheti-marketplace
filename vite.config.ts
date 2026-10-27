import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': __dirname,
      },
    },
    envPrefix: 'VITE_',
    optimizeDeps: {
      include: ['react-is', 'recharts'],
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts') || id.includes('react-is')) return 'vendor-charts';
              if (id.includes('leaflet')) return 'vendor-leaflet';
              if (id.includes('motion')) return 'vendor-motion';
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react/')) return 'vendor-react';
            }
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
