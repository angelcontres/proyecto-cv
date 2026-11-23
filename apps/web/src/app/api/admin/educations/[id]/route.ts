import type { NextRequest } from "next/server";
import { educationHandlers } from "@cv/api-cv";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return educationHandlers.update(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return educationHandlers.remove(request, context);
}
