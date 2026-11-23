import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const rootEnvPath = path.resolve(__dirname, "../../.env");
if (!process.env.DATABASE_URL && fs.existsSync(rootEnvPath)) {
  try {
    process.loadEnvFile?.(rootEnvPath);
  } catch {
    // El entorno ya define variables por otro mecanismo (Docker / CI)
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: [
    "@cv/contracts",
    "@cv/core",
    "@cv/database",
    "@cv/api-auth",
    "@cv/api-cv",
    "@cv/api-certifications",
    "@cv/media-vault",
    "@cv/api-studio",
    "@cv/api-contact",
  ],
};

export default nextConfig;
