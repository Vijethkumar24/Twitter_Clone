import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load the environment variables based on the mode (e.g., 'development', 'production')
  const env = loadEnv(mode, process.cwd(), ""); // Load all env variables

  return {
    plugins: [react()],
    build: {
      outDir: "dist", // output folder for build
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "http://localhost:5000", // Use the loaded env variable for API base URL
          changeOrigin: true,
        },
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV), // Define additional environment variables for use in the app
    },
  };
});
