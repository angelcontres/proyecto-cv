import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@cv/api-auth";
import { findAssetByIdWithCertification } from "../repositories/asset.repository";
import { getStorageProvider } from "../storage";

export async function handleGetAsset(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const asset = await findAssetByIdWithCertification(id);

  if (!asset) {
    return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
  }

  const session = await getServerSession();
  const isOwner = Boolean(session && session.userId === asset.userId);
  const isPublicCert = Boolean(asset.certification && asset.certification.isVisible);

  if (!isOwner && !isPublicCert) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  const wantsDownload = request.nextUrl.searchParams.get("download") === "1";
  const allowDownload = isOwner || Boolean(asset.certification?.allowDownload);

  const storage = getStorageProvider();
  const exists = await storage.exists(asset.storageKey);
  if (!exists) {
    return NextResponse.json({ error: "Archivo binario no disponible." }, { status: 404 });
  }

  const buffer = await storage.read(asset.storageKey);
  const disposition =
    wantsDownload && allowDownload
      ? `attachment; filename="${asset.originalName}"`
      : `inline; filename="${asset.originalName}"`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(buffer.byteLength),
      "Content-Disposition": disposition,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
