import { prisma } from "@cv/database";
import type { ContactMessageInput } from "../schemas/contact.schema";

export function findPrimaryProfileForContact() {
  return prisma.profile.findFirst({
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    select: { id: true },
  });
}

export function createContactMessage(profileId: string, data: ContactMessageInput) {
  return prisma.contactMessage.create({
    data: {
      profileId,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      company: data.company || null,
      subject: data.subject,
      message: data.message,
    },
  });
}

export function listMessagesByProfile(profileId: string) {
  return prisma.contactMessage.findMany({
    where: { profileId },
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
  });
}

export function updateMessageReadState(id: string, profileId: string, isRead: boolean) {
  return prisma.contactMessage.updateMany({
    where: { id, profileId },
    data: { isRead },
  });
}

export function deleteMessageForProfile(id: string, profileId: string) {
  return prisma.contactMessage.deleteMany({
    where: { id, profileId },
  });
}
