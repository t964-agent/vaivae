import eslintConfigPrettier from "eslint-config-prettier/flat";

import { baseConfig } from "../../eslint.config.mjs";

const config = [
  ...baseConfig,
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.admin.json"],
        projectService: false,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        console: "readonly",
        process: "readonly",
        setImmediate: "readonly",
        setInterval: "readonly",
        setTimeout: "readonly",
        clearImmediate: "readonly",
        clearInterval: "readonly",
        clearTimeout: "readonly",
      },
    },
  },
  {
    files: ["scripts/**/*.{ts,tsx,js,jsx,mjs,cjs}", "src/scripts/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    rules: {
      "no-console": "off",
    },
  },
  eslintConfigPrettier,
];

export default config;
