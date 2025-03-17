import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: '.',
  base: '/',
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src'),
      "react-native": "react-native-web",
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});