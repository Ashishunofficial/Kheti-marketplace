import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': import.meta.dirname,
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
          // manualChunks must be a function in rolldown (Vite 8)
          manualChunks(id: string) {
            if (id.includes('node_modules/recharts') || id.includes('node_modules/react-is')) return 'vendor-charts';
            if (id.includes('node_modules/leaflet')) return 'vendor-leaflet';
            if (id.includes('node_modules/motion')) return 'vendor-motion';
            if (id.includes('node_modules/@supabase')) return 'vendor-supabase';
            if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor-react';
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
