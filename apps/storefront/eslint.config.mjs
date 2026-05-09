import eslintConfigPrettier from "eslint-config-prettier/flat";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

import { baseConfig } from "../../eslint.config.mjs";

const config = [
  ...baseConfig,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    settings: {
      next: {
        rootDir: ["apps/storefront/"],
      },
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
    },
  },
  eslintConfigPrettier,
];

export default config;
