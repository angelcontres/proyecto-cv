import type { NextRequest } from "next/server";
import { handleCreateCertification, handleListCertifications } from "@cv/api-certifications";

export async function GET() {
  return handleListCertifications();
}

export async function POST(request: NextRequest) {
  return handleCreateCertification(request);
}
