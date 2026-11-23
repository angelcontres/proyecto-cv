import type { NextRequest } from "next/server";
import { handleLogin } from "@cv/api-auth";

export async function POST(request: NextRequest) {
  return handleLogin(request);
}
