import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:5000/";
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // ensure this is set to 'dist'
  },
  server: {
    proxy: {
      "/api": {
        target: API_BASE_URL,
        changeOrigin: true,
      },
    },
  },
});
