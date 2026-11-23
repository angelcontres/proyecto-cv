import type { NextRequest } from "next/server";
import { handleGetProfile, handleUpdateProfile } from "@cv/api-cv";

export async function GET() {
  return handleGetProfile();
}

export async function PUT(request: NextRequest) {
  return handleUpdateProfile(request);
}
