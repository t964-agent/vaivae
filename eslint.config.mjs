import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const ignores = [
  "_archive/**",
  "**/node_modules/**",
  "**/.next/**",
  "**/.medusa/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/playwright-report/**",
  "**/test-results/**",
  "**/.turbo/**",
  "pnpm-lock.yaml",
];

const commonRules = {
  eqeqeq: ["error", "always"],
  "no-console": ["warn", { allow: ["warn", "error"] }],
  "no-implicit-coercion": "error",
  "no-var": "error",
  "object-shorthand": "error",
  "prefer-const": ["error", { destructuring: "all" }],
};

const typescriptRules = {
  ...commonRules,
  "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
  "@typescript-eslint/consistent-type-definitions": ["error", "type"],
  "@typescript-eslint/consistent-type-imports": [
    "error",
    {
      prefer: "type-imports",
      fixStyle: "inline-type-imports",
    },
  ],
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-import-type-side-effects": "error",
  "@typescript-eslint/no-non-null-assertion": "error",
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
      destructuredArrayIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    },
  ],
};

export const baseConfig = [
  {
    ignores,
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: commonRules,
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      ecmaVersion: 2024,
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: "module",
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: typescriptRules,
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/consistent-type-definitions": "off",
    },
  },
];

const config = [...baseConfig, eslintConfigPrettier];

export default config;
