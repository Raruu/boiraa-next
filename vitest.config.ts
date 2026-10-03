import { defineConfig } from "vitest/config";

/**
 * Vitest config for the boilerplate.
 *
 * - `resolve.tsconfigPaths` reuses the `@/*` alias from tsconfig.json (Vite 8+ native support).
 * - Default environment is `node` (server-side units). For a DOM test, add the
 *   `// @vitest-environment jsdom` pragma at the top of the test file.
 * - Test files live next to the code they cover: `src/**\/*.test.ts(x)`.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.next/**", "src/generated/**"],
  },
});
