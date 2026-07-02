import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Mobile-specific Vite config
// - Always runs on port 8080 (matched by Capacitor live reload URL)
// - Loads index.mobile.html as entry point
// - host 0.0.0.0 required for Capacitor to connect from Android device

export default defineConfig({
  base: '/',
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
  },
  build: {
    target: 'chrome87',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    outDir: 'dist',
    rollupOptions: {
      input: 'index.mobile.html',
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'lucide-icons': ['lucide-react'],
          'firebase-core': ['firebase/app', 'firebase/auth', 'firebase/messaging'],
          'framer-motion': ['framer-motion'],
          'ui-radix': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
