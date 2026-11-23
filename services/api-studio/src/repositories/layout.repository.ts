import { prisma, type Prisma } from "@cv/database";

export async function getLayoutStateByProfile(profileId: string) {
  const [draft, published, history] = await Promise.all([
    prisma.pageLayout.findFirst({
      where: { profileId, status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.pageLayout.findFirst({
      where: { profileId, status: "PUBLISHED" },
      orderBy: { version: "desc" },
    }),
    prisma.pageLayout.findMany({
      where: { profileId },
      orderBy: { version: "desc" },
      take: 10,
      select: { id: true, status: true, version: true, publishedAt: true, updatedAt: true },
    }),
  ]);

  return { draft, published, history };
}

export async function saveDraftAndMaybePublish(params: {
  profileId: string;
  serializedCanvas: Prisma.InputJsonValue;
  publish: boolean;
}) {
  const { profileId, serializedCanvas, publish } = params;

  return prisma.$transaction(async (tx) => {
    const existingDraft = await tx.pageLayout.findFirst({
      where: { profileId, status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
    });

    const latestVersion = await tx.pageLayout.findFirst({
      where: { profileId },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const nextVersion = (latestVersion?.version ?? 0) + 1;

    const draft = existingDraft
      ? await tx.pageLayout.update({
          where: { id: existingDraft.id },
          data: { canvasSchema: serializedCanvas },
        })
      : await tx.pageLayout.create({
          data: {
            profileId,
            status: "DRAFT",
            version: nextVersion,
            canvasSchema: serializedCanvas,
          },
        });

    if (!publish) {
      return { draft, published: null };
    }

    await tx.pageLayout.updateMany({
      where: { profileId, status: "PUBLISHED" },
      data: { status: "ARCHIVED" },
    });

    const published = await tx.pageLayout.create({
      data: {
        profileId,
        status: "PUBLISHED",
        version: nextVersion,
        canvasSchema: serializedCanvas,
        publishedAt: new Date(),
      },
    });

    return { draft, published };
  });
}
