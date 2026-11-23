import type { NextRequest } from "next/server";
import { handleGetLayout, handleSaveLayout } from "@cv/api-studio";

export async function GET() {
  return handleGetLayout();
}

export async function PUT(request: NextRequest) {
  return handleSaveLayout(request);
}
