import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: [
        "apps/storefront/src/lib/utils.ts",
        "apps/storefront/src/lib/format.ts",
        "apps/storefront/src/lib/cart-utils.ts",
        "apps/storefront/src/lib/url-state/products-filters.ts",
        "apps/storefront/src/components/ui/button.tsx",
        "apps/storefront/src/components/cards/product-card.tsx",
        "apps/medusa/src/lib/env.ts",
        "apps/medusa/src/modules/marketing-consent/service.ts",
        "apps/medusa/src/modules/sanity-sync/service.ts",
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
    projects: ["apps/storefront/vitest.config.ts", "apps/medusa/vitest.config.ts"],
  },
});
