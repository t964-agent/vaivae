import { existsSync } from "node:fs";

const tailwindStylesheet = "./apps/storefront/src/styles/globals.css";

/** @type {import("prettier").Config} */
const config = {
  printWidth: 100,
  singleQuote: false,
  trailingComma: "all",
  semi: true,
  arrowParens: "always",
  tabWidth: 2,
  endOfLine: "lf",
  plugins: ["prettier-plugin-tailwindcss"],
  ...(existsSync(new URL(tailwindStylesheet, import.meta.url)) ? { tailwindStylesheet } : {}),
};

export default config;
