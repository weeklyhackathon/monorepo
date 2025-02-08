import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      'testing.weeklyhackathon.com',
      'hackathontoken.com',
      'weeklyhackathon.com'
    ],
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    host: true
  }
});
