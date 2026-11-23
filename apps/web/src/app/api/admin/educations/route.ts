import type { NextRequest } from "next/server";
import { educationHandlers } from "@cv/api-cv";

export async function GET() {
  return educationHandlers.list();
}

export async function POST(request: NextRequest) {
  return educationHandlers.create(request);
}
