import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          finance: path.resolve(__dirname, 'finance.html'),
          partnership: path.resolve(__dirname, 'partnership.html'),
          testimonies: path.resolve(__dirname, 'testimonies.html'),
          baptism: path.resolve(__dirname, 'baptism.html'),
          media: path.resolve(__dirname, 'media.html'),
          settings: path.resolve(__dirname, 'settings.html'),
        },
      },
    },
  };
});
