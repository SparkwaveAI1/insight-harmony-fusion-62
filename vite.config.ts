import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Raise warning threshold — we know about the large chunks
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor: react core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // Vendor: router
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          // Vendor: supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // Vendor: charts (recharts is large)
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          // Vendor: radix UI components
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          // Vendor: other node_modules
          if (id.includes('node_modules/')) {
            return 'vendor-misc';
          }
          // App: research session components (the large lazy chunk)
          if (id.includes('/src/components/research/') || id.includes('/src/pages/Research')) {
            return 'app-research';
          }
          // App: persona components
          if (id.includes('/src/components/personas/') || id.includes('/src/pages/Persona')) {
            return 'app-personas';
          }
          // App: admin
          if (id.includes('/src/pages/Admin') || id.includes('/src/components/admin/')) {
            return 'app-admin';
          }
          // App: collections
          if (id.includes('/src/pages/Collection') || id.includes('/src/components/collections/')) {
            return 'app-collections';
          }
        },
      },
    },
  },
}));
