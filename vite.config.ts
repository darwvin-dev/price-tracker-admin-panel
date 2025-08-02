import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/kalatik-proxy": {
        target: "https://kalatik.com",
        changeOrigin: true,
        rewrite: (path) => 
          path.replace(/^\/api\/kalatik-proxy/, "/product/index"),
      },
      "/kalatik-product": {
        target: "https://kalatik.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/kalatik-product/, ""),
      },
    },
  },
});
