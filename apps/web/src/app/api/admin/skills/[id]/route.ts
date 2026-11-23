import type { NextRequest } from "next/server";
import { skillHandlers } from "@cv/api-cv";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return skillHandlers.update(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return skillHandlers.remove(request, context);
}
