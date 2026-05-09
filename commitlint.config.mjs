export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [2, "always", 100],
    "footer-max-line-length": [2, "always", 100],
    "header-max-length": [2, "always", 120],
    "scope-case": [2, "always", "kebab-case"],
    "scope-enum": [2, "always", ["storefront", "medusa", "sanity", "docs", "infra", "repo"]],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "type-case": [2, "always", "lower-case"],
  },
};
