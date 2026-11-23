import type { NextRequest } from "next/server";
import { experienceHandlers } from "@cv/api-cv";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return experienceHandlers.update(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return experienceHandlers.remove(request, context);
}
