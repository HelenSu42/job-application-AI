import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    environment: "node",
    globals: false,
    passWithNoTests: false,
    setupFiles: ["./test/setup.ts"],
    reporters: ["default"],
    coverage: {
      enabled: false
    }
  }
});