import type { NextRequest } from "next/server";
import { handleDeleteMessage, handleMarkMessageRead } from "@cv/api-contact";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleMarkMessageRead(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleDeleteMessage(request, context);
}
