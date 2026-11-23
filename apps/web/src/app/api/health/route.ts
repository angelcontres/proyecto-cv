import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "cv-gateway",
    timestamp: new Date().toISOString(),
  });
}
