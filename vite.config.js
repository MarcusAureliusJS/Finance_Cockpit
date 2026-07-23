import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" -> funktioniert auf GitHub Pages unter beliebigem Unterpfad
export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "app.js",
        chunkFileNames: "app-[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
  plugins: [react()],
});
