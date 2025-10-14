import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/ddr-core-intended-categories/",
  // No aliases or Carbon chart optimization — those were causing the crash
});
