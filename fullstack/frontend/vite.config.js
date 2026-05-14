import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/yahoo": {
        target: "https://query2.finance.yahoo.com",
        changeOrigin: true,
        secure: false, // Tambahkan ini agar lebih aman dari masalah SSL
        rewrite: (path) => path.replace(/^\/yahoo/, ""),
      },
    },
  },
});
