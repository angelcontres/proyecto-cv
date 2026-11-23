import { handleListMessages } from "@cv/api-contact";

export async function GET() {
  return handleListMessages();
}
