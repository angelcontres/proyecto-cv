import { prisma } from "@cv/database";

export function findAuthUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  });
}

export function findPrimaryProfileIdByUser(userId: string) {
  return prisma.profile.findFirst({
    where: { userId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    select: { id: true },
  });
}
