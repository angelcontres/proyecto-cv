import { handleMe } from "@cv/api-auth";

export async function GET() {
  return handleMe();
}
