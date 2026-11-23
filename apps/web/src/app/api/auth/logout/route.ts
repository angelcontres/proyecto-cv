import { handleLogout } from "@cv/api-auth";

export async function POST() {
  return handleLogout();
}
