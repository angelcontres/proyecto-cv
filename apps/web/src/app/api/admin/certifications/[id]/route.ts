import type { NextRequest } from "next/server";
import { handleDeleteCertification, handleUpdateCertification } from "@cv/api-certifications";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleUpdateCertification(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleDeleteCertification(request, context);
}
