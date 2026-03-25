import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      api: fileURLToPath(new URL("./src/api", import.meta.url)),
      app: fileURLToPath(new URL("./src/app", import.meta.url)),
      components: fileURLToPath(new URL("./src/components", import.meta.url)),
      features: fileURLToPath(new URL("./src/features", import.meta.url)),
      hooks: fileURLToPath(new URL("./src/hooks", import.meta.url)),
      lib: fileURLToPath(new URL("./src/lib", import.meta.url)),
      pages: fileURLToPath(new URL("./src/pages", import.meta.url)),
      styles: fileURLToPath(new URL("./src/styles", import.meta.url)),
      types: fileURLToPath(new URL("./src/types", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
