import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log(env.VITE_API_URL);
  return {
    define: {
      // Inject environment variables into the app
      "process.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
    },
    plugins: [react()],
    build: {
      outDir: "dist", // ensure this is set to 'dist'
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5000/",
          changeOrigin: true,
        },
      },
    },
  };
});
