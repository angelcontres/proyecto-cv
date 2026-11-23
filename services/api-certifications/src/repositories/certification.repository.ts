import { prisma } from "@cv/database";
import type { CertificationMetadataInput } from "../schemas/certification.schema";

export function listCertificationsByProfile(profileId: string) {
  return prisma.certification.findMany({
    where: { profileId },
    include: {
      fileAsset: {
        select: { id: true, originalName: true, sizeBytes: true, mimeType: true, createdAt: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { issueDate: "desc" }],
  });
}

export function findCertificationForProfile(id: string, profileId: string) {
  return prisma.certification.findFirst({
    where: { id, profileId },
    select: { id: true },
  });
}

export function findCertificationWithAsset(id: string, profileId: string) {
  return prisma.certification.findFirst({
    where: { id, profileId },
    include: { fileAsset: true },
  });
}

export function createCertificationWithOptionalAsset(params: {
  userId: string;
  profileId: string;
  meta: CertificationMetadataInput;
  uploadedAsset: {
    storageKey: string;
    sanitizedOriginalName: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
  } | null;
}) {
  const { userId, profileId, meta, uploadedAsset } = params;

  return prisma.$transaction(async (tx) => {
    let fileAssetId: string | null = null;

    if (uploadedAsset) {
      const asset = await tx.fileAsset.create({
        data: {
          userId,
          storageKey: uploadedAsset.storageKey,
          originalName: uploadedAsset.sanitizedOriginalName,
          mimeType: uploadedAsset.mimeType,
          sizeBytes: uploadedAsset.sizeBytes,
          sha256: uploadedAsset.sha256,
          kind: "CERT_PDF",
        },
      });
      fileAssetId = asset.id;
    }

    return tx.certification.create({
      data: {
        profileId,
        fileAssetId,
        titleI18n: meta.titleI18n,
        issuer: meta.issuer,
        issueDate: new Date(meta.issueDate),
        expiryDate: meta.expiryDate ? new Date(meta.expiryDate) : null,
        category: meta.category,
        credentialId: meta.credentialId || null,
        verifyUrl: meta.verifyUrl || null,
        skills: meta.skills,
        allowDownload: meta.allowDownload,
        sortOrder: meta.sortOrder,
        isVisible: meta.isVisible,
      },
      include: {
        fileAsset: {
          select: { id: true, originalName: true, sizeBytes: true, mimeType: true },
        },
      },
    });
  });
}

export function updateCertificationMetadata(id: string, meta: CertificationMetadataInput) {
  return prisma.certification.update({
    where: { id },
    data: {
      titleI18n: meta.titleI18n,
      issuer: meta.issuer,
      issueDate: new Date(meta.issueDate),
      expiryDate: meta.expiryDate ? new Date(meta.expiryDate) : null,
      category: meta.category,
      credentialId: meta.credentialId || null,
      verifyUrl: meta.verifyUrl || null,
      skills: meta.skills,
      allowDownload: meta.allowDownload,
      sortOrder: meta.sortOrder,
      isVisible: meta.isVisible,
    },
    include: {
      fileAsset: {
        select: { id: true, originalName: true, sizeBytes: true, mimeType: true },
      },
    },
  });
}

export function deleteCertificationAndAssetRecord(id: string, fileAssetId?: string | null) {
  return prisma.$transaction(async (tx) => {
    await tx.certification.delete({ where: { id } });
    if (fileAssetId) {
      await tx.fileAsset.delete({ where: { id: fileAssetId } });
    }
  });
}
