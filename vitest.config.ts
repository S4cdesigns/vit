import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["test/setup.ts"],
    exclude: ["testx", "node_modules"],
    env: {
      NODE_ENV: "test",
    },
  },
});
