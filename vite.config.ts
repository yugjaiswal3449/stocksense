import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          icons: ["lucide-react"],
        },
      },
    },
  },
  test: { environment: "jsdom", setupFiles: "./src/test/setup.ts" },
});
