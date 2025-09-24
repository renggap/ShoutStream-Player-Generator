import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from '@unocss/vite';
import presetWind from '@unocss/preset-wind';
import presetIcons from '@unocss/preset-icons';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        UnoCSS({
          presets: [
            presetWind(),
            presetIcons(),
          ],
          content: {
            pipeline: {
              include: [
                './index.html',
                './src/**/*.{js,ts,jsx,tsx}',
                './components/**/*.{js,ts,jsx,tsx}',
              ],
            },
          },
        }),
      ],
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
        rollupOptions: {
          external: [],
          output: {
            manualChunks: undefined,
          }
        },
        cssCodeSplit: false
      }
    };
});
