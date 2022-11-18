import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["test/setup.ts"],
    exclude: ["testx", "node_modules", "build", ".next", ".test"],
    env: {
      NODE_ENV: "test",
    },
  },
});
