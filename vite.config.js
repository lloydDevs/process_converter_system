import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Specify which Node.js modules to polyfill
      include: ["buffer", "process"],
    }),
  ],
  define: {
    // Define global variables for `Buffer` and `process`
    global: "globalThis",
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
