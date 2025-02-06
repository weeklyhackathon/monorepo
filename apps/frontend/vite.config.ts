import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["testing.weeklyhackathon.com"],
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: true,
  },
});
