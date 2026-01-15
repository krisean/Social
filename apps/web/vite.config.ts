import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Load environment variables from project root (where .env.local is located)
  envDir: path.resolve(__dirname, '../../'),
});
