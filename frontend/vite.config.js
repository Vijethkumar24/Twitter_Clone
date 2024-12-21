import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // ensure this is set to 'dist'
  },
  server: {
    proxy: {
      "/api": {
        target: "http://twitter-clone-f64h.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
