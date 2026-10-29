import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// During `npm run dev`, requests to /api are forwarded to your backend.
// Set VITE_DEV_PROXY in .env.local (e.g. http://localhost:8000) to turn this on.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: env.VITE_DEV_PROXY
      ? { proxy: { '/api': { target: env.VITE_DEV_PROXY, changeOrigin: true } } }
      : undefined,
  };
});
