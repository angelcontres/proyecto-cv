import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "services/*/tests/**/*.test.ts",
      "packages/*/tests/**/*.test.ts",
      "apps/*/tests/**/*.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@web": path.resolve(__dirname, "./apps/web/src"),
      "@cv/contracts": path.resolve(__dirname, "./packages/contracts/src/index.ts"),
      "@cv/core": path.resolve(__dirname, "./packages/core/src/index.ts"),
      "@cv/database": path.resolve(__dirname, "./packages/database/src/index.ts"),
      "@cv/api-auth": path.resolve(__dirname, "./services/api-auth/src/index.ts"),
      "@cv/api-auth/edge": path.resolve(__dirname, "./services/api-auth/src/edge.ts"),
      "@cv/api-cv": path.resolve(__dirname, "./services/api-cv/src/index.ts"),
      "@cv/api-certifications": path.resolve(__dirname, "./services/api-certifications/src/index.ts"),
      "@cv/media-vault": path.resolve(__dirname, "./services/media-vault/src/index.ts"),
      "@cv/api-studio": path.resolve(__dirname, "./services/api-studio/src/index.ts"),
      "@cv/api-contact": path.resolve(__dirname, "./services/api-contact/src/index.ts"),
    },
  },
});
