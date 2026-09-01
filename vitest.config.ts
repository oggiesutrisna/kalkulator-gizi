import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
