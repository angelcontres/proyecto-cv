import type { NextRequest } from "next/server";
import { projectHandlers } from "@cv/api-cv";

export async function GET() {
  return projectHandlers.list();
}

export async function POST(request: NextRequest) {
  return projectHandlers.create(request);
}
