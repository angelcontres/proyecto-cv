import type { NextRequest } from "next/server";
import { skillHandlers } from "@cv/api-cv";

export async function GET() {
  return skillHandlers.list();
}

export async function POST(request: NextRequest) {
  return skillHandlers.create(request);
}
