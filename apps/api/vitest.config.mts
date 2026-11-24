import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/__tests__/**/*.test.ts"],
          exclude: ["**/*.int.test.ts"],
        },
      },
      {
        test: {
          name: "integration",
          include: ["src/**/__tests__/**/*.int.test.ts"],
          hookTimeout: 120_000,
          testTimeout: 30_000,
          // One file at a time: parallel workers unpacking mongod at once corrupt the binary
          fileParallelism: false,
        },
      },
    ],
  },
});
