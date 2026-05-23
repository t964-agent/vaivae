import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "@/medusa": path.resolve(appRoot, "./src/lib/medusa"),
      "@": path.resolve(appRoot, "./src"),
      "server-only": path.resolve(appRoot, "./vitest.server-only.ts"),
    },
  },
  test: {
    coverage: {
      include: [
        "src/lib/utils.ts",
        "src/lib/format.ts",
        "src/lib/cart-utils.ts",
        "src/lib/url-state/products-filters.ts",
        "src/components/ui/button.tsx",
        "src/components/cards/product-card.tsx",
      ],
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },
    environment: "jsdom",
    globals: false,
    include: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
    name: "@vaivae/storefront",
    setupFiles: ["./vitest.setup.ts"],
  },
});
