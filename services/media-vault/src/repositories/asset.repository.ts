import { prisma } from "@cv/database";

export function findAssetByIdWithCertification(id: string) {
  return prisma.fileAsset.findUnique({
    where: { id },
    include: {
      certification: {
        select: { isVisible: true, allowDownload: true },
      },
    },
  });
}
