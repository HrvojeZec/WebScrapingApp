import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && /\.woff2?$/.test(assetInfo.name)) {
            return `assets/fonts/${assetInfo.name}`;
          }
          return `assets/${assetInfo.name}`;
        },
      },
    },
  },
});
