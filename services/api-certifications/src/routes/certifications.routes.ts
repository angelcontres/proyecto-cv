import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedContext } from "@cv/api-auth";
import { getEnvConfig, notFoundResponse, parseAndValidate } from "@cv/core";
import { getStorageProvider, validatePdfBuffer } from "@cv/media-vault";
import {
  createCertificationWithOptionalAsset,
  deleteCertificationAndAssetRecord,
  findCertificationForProfile,
  findCertificationWithAsset,
  listCertificationsByProfile,
  updateCertificationMetadata,
} from "../repositories/certification.repository";
import { certificationMetadataSchema } from "../schemas/certification.schema";

export async function handleListCertifications() {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) return auth.response;

  const items = await listCertificationsByProfile(auth.ctx.profileId);
  return NextResponse.json({ items });
}

export async function handleCreateCertification(request: NextRequest) {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) return auth.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Se esperaba multipart/form-data para crear una certificación." },
      { status: 400 }
    );
  }

  const rawMeta = formData.get("metadata");
  if (typeof rawMeta !== "string") {
    return NextResponse.json(
      { error: "Falta el campo 'metadata' con los datos de la certificación." },
      { status: 400 }
    );
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawMeta);
  } catch {
    return NextResponse.json({ error: "El campo 'metadata' no es JSON válido." }, { status: 400 });
  }

  const metaValidation = certificationMetadataSchema.safeParse(parsedJson);
  if (!metaValidation.success) {
    return NextResponse.json(
      {
        error: "Metadatos de certificación inválidos.",
        details: metaValidation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const meta = metaValidation.data;
  const maybeFile = formData.get("file");
  const storage = getStorageProvider();
  let uploadedKey: string | null = null;
  let uploadedAsset: {
    storageKey: string;
    sanitizedOriginalName: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
  } | null = null;

  if (maybeFile instanceof File && maybeFile.size > 0) {
    const buffer = Buffer.from(await maybeFile.arrayBuffer());
    const { maxPdfBytes } = getEnvConfig();
    const check = validatePdfBuffer({
      buffer,
      originalName: maybeFile.name,
      mimeType: maybeFile.type,
      maxBytes: maxPdfBytes,
    });

    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    uploadedKey = `certifications/${crypto.randomUUID()}.pdf`;
    await storage.put(uploadedKey, buffer);
    uploadedAsset = {
      storageKey: uploadedKey,
      sha256: check.sha256,
      sizeBytes: check.sizeBytes,
      sanitizedOriginalName: check.sanitizedOriginalName,
      mimeType: "application/pdf",
    };
  }

  try {
    const created = await createCertificationWithOptionalAsset({
      userId: auth.ctx.session.userId,
      profileId: auth.ctx.profileId,
      meta,
      uploadedAsset,
    });
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    if (uploadedKey) {
      await storage.remove(uploadedKey).catch(() => undefined);
    }
    throw error;
  }
}

export async function handleUpdateCertification(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const existing = await findCertificationForProfile(id, auth.ctx.profileId);
  if (!existing) return notFoundResponse("Certificación no encontrada.");

  const parsed = await parseAndValidate(request, certificationMetadataSchema);
  if (!parsed.ok) return parsed.response;

  const updated = await updateCertificationMetadata(id, parsed.data);
  return NextResponse.json({ item: updated });
}

export async function handleDeleteCertification(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const existing = await findCertificationWithAsset(id, auth.ctx.profileId);
  if (!existing) return notFoundResponse("Certificación no encontrada.");

  await deleteCertificationAndAssetRecord(id, existing.fileAsset?.id);

  if (existing.fileAsset) {
    const storage = getStorageProvider();
    await storage.remove(existing.fileAsset.storageKey).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}
