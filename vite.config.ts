import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// Public (publishable) backend values — safe to ship in the browser bundle.
// Used as a fallback when the build environment has no .env file (e.g. publish builds).
const FALLBACK_ENV = {
  VITE_SUPABASE_URL: "https://rxjjwyurupxgneykiigo.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_YNeybcq9MmwZUuO7n34o8Q_prgYMvqt",
  VITE_SUPABASE_PROJECT_ID: "rxjjwyurupxgneykiigo",
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const define: Record<string, string> = {};
  for (const [key, value] of Object.entries(FALLBACK_ENV)) {
    if (!env[key] && !process.env[key]) {
      define[`import.meta.env.${key}`] = JSON.stringify(value);
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    define,
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "ui-vendor": ["framer-motion", "lottie-react"],
            "radix-vendor": [
              "@radix-ui/react-accordion",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-navigation-menu",
            ],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: mode === "development",
    },
  };
});
