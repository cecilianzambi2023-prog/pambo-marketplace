import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: true,
        hmr: {
          host: 'localhost',
          port: 3000,
          protocol: 'ws'
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('react-dom') || id.includes('react')) return 'vendor-react';
                if (id.includes('@supabase')) return 'vendor-supabase';
                if (id.includes('react-leaflet') || id.includes('leaflet')) return 'vendor-maps';
                if (id.includes('lucide-react')) return 'vendor-icons';
                if (id.includes('@google/genai')) return 'vendor-ai';
                return 'vendor-misc';
              }
            }
          }
        }
      }
    };
});
