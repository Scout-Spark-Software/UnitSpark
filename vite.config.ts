import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    alias: {
      $lib: "/src/lib",
      $app: "/node_modules/@sveltejs/kit/src/runtime/app",
    },
  },
  resolve: {
    conditions: ["browser"],
  },
});
