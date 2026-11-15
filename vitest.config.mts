import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts", ".github/scripts/**/*.test.mjs"],
    coverage: {
      provider: "v8",
      // Pages are left out: async Server Components can't be unit tested.
      include: ["src/lib/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
      reporter: ["text", "json-summary", "json"],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
