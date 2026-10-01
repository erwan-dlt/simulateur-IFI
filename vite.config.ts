import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./", // chemins relatifs : fonctionne aussi dans Tauri / en fichier local
  plugins: [react()],
});
