import type { NextRequest } from "next/server";
import { experienceHandlers } from "@cv/api-cv";

export async function GET() {
  return experienceHandlers.list();
}

export async function POST(request: NextRequest) {
  return experienceHandlers.create(request);
}
