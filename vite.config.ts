import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  // Native Android/iOS shell runs from https://localhost, so deep routes
  // need root-based assets instead of relative ones.
  base: '/',
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
      "/ollama-proxy": {
        target: "http://localhost:11434",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama-proxy/, ''),
      },
      "/chatr-worker": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chatr-worker/, ''),
      },
    },
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['capacitor-native-biometric'],
  },
  esbuild: {
    // Strip debugger and console log statements in production builds for smaller JS size
    drop: mode === 'production' ? ['debugger', 'console'] : [],
    legalComments: 'none',
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://nuuuqazaoaozgblmvkzn.supabase.co'),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_HRiuUoHejwLnOdITsW36Ew_ZSZ513Tw'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_HRiuUoHejwLnOdITsW36Ew_ZSZ513Tw'),
  },
  build: {
    target: 'es2020',
    emptyOutDir: true,
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1200,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'tanstack-query': ['@tanstack/react-query'],
          'supabase-client': ['@supabase/supabase-js'],
          'lucide-icons': ['lucide-react'],
          'firebase-core': ['firebase/app', 'firebase/auth', 'firebase/messaging'],
          'framer-motion': ['framer-motion'],
          'ui-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-switch'
          ],
        },
      },
    },
  },
}));
