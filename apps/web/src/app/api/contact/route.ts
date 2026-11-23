import type { NextRequest } from "next/server";
import { handleSubmitPublicContact } from "@cv/api-contact";

export async function POST(request: NextRequest) {
  return handleSubmitPublicContact(request);
}
