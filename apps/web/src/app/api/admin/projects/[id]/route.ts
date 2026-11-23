import type { NextRequest } from "next/server";
import { projectHandlers } from "@cv/api-cv";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return projectHandlers.update(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return projectHandlers.remove(request, context);
}
