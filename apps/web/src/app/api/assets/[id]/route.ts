import type { NextRequest } from "next/server";
import { handleGetAsset } from "@cv/media-vault";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleGetAsset(request, context);
}
