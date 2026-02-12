import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/twikoo': {
        target: 'https://cwd.liucfamily.cn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/twikoo/, '')
      }
    }
  }
});
