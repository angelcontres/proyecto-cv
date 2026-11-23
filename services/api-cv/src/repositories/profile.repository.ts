import { prisma } from "@cv/database";
import type { ProfileUpdateInput } from "../schemas/profile.schema";

export function findProfileById(profileId: string) {
  return prisma.profile.findUnique({
    where: { id: profileId },
  });
}

export function findSlugConflict(slug: string, excludeProfileId: string) {
  return prisma.profile.findFirst({
    where: { slug, id: { not: excludeProfileId } },
    select: { id: true },
  });
}

export function updateProfileById(profileId: string, input: ProfileUpdateInput) {
  return prisma.profile.update({
    where: { id: profileId },
    data: {
      slug: input.slug,
      defaultLocale: input.defaultLocale,
      localizedInfo: input.localizedInfo,
      socialLinks: input.socialLinks,
    },
  });
}

export async function getAdminOverviewCounts(userId: string) {
  const profile = await prisma.profile.findFirst({
    where: { userId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    include: {
      _count: {
        select: {
          experiences: true,
          educations: true,
          projects: true,
          skills: true,
          certifications: true,
          contactMessages: true,
        },
      },
    },
  });

  return (
    profile?._count ?? {
      experiences: 0,
      educations: 0,
      projects: 0,
      skills: 0,
      certifications: 0,
      contactMessages: 0,
    }
  );
}

export async function getPrimaryPublishedShowcase() {
  try {
    return await prisma.profile.findFirst({
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      include: {
        pageLayouts: {
          where: { status: "PUBLISHED" },
          orderBy: { version: "desc" },
          take: 1,
        },
        experiences: {
          where: { isVisible: true },
          orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
        },
        skills: {
          where: { isVisible: true },
          orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
        },
        certifications: {
          where: { isVisible: true },
          orderBy: [{ sortOrder: "asc" }, { issueDate: "desc" }],
          include: {
            fileAsset: { select: { id: true, originalName: true } },
          },
        },
      },
    });
  } catch {
    return null;
  }
}
