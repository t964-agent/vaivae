const config = {
  test: {
    coverage: {
      exclude: ["src/**/*.test.ts", "src/scripts/**"],
      include: [
        "src/lib/env.ts",
        "src/modules/marketing-consent/service.ts",
        "src/modules/sanity-sync/service.ts",
      ],
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    environment: "node",
    fileParallelism: false,
    globals: true,
    include: ["src/**/*.test.ts"],
    name: "@vaivae/medusa",
  },
} as const;

export = config;
