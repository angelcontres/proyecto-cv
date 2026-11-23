import { prisma } from "@cv/database";
import type {
  EducationInput,
  ExperienceInput,
  ProjectInput,
  SkillInput,
} from "../schemas/career.schema";

export const experiencesRepo = {
  list(profileId: string) {
    return prisma.experience.findMany({
      where: { profileId },
      orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
    });
  },
  findOwned(id: string, profileId: string) {
    return prisma.experience.findFirst({ where: { id, profileId }, select: { id: true } });
  },
  create(profileId: string, data: ExperienceInput) {
    return prisma.experience.create({
      data: {
        profileId,
        company: data.company,
        location: data.location || null,
        roleI18n: data.roleI18n,
        summaryI18n: data.summaryI18n,
        highlightsI18n: data.highlightsI18n,
        tags: data.tags,
        startDate: new Date(data.startDate),
        endDate: data.isCurrent || !data.endDate ? null : new Date(data.endDate),
        isCurrent: data.isCurrent,
        sortOrder: data.sortOrder,
        isVisible: data.isVisible,
      },
    });
  },
  update(id: string, data: ExperienceInput) {
    return prisma.experience.update({
      where: { id },
      data: {
        company: data.company,
        location: data.location || null,
        roleI18n: data.roleI18n,
        summaryI18n: data.summaryI18n,
        highlightsI18n: data.highlightsI18n,
        tags: data.tags,
        startDate: new Date(data.startDate),
        endDate: data.isCurrent || !data.endDate ? null : new Date(data.endDate),
        isCurrent: data.isCurrent,
        sortOrder: data.sortOrder,
        isVisible: data.isVisible,
      },
    });
  },
  deleteOwned(id: string, profileId: string) {
    return prisma.experience.deleteMany({ where: { id, profileId } });
  },
};

export const educationsRepo = {
  list(profileId: string) {
    return prisma.education.findMany({
      where: { profileId },
      orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
    });
  },
  findOwned(id: string, profileId: string) {
    return prisma.education.findFirst({ where: { id, profileId }, select: { id: true } });
  },
  create(profileId: string, data: EducationInput) {
    return prisma.education.create({
      data: {
        profileId,
        institution: data.institution,
        location: data.location || null,
        degreeI18n: data.degreeI18n,
        summaryI18n: data.summaryI18n,
        startDate: new Date(data.startDate),
        endDate: data.isCurrent || !data.endDate ? null : new Date(data.endDate),
        isCurrent: data.isCurrent,
        sortOrder: data.sortOrder,
        isVisible: data.isVisible,
      },
    });
  },
  update(id: string, data: EducationInput) {
    return prisma.education.update({
      where: { id },
      data: {
        institution: data.institution,
        location: data.location || null,
        degreeI18n: data.degreeI18n,
        summaryI18n: data.summaryI18n,
        startDate: new Date(data.startDate),
        endDate: data.isCurrent || !data.endDate ? null : new Date(data.endDate),
        isCurrent: data.isCurrent,
        sortOrder: data.sortOrder,
        isVisible: data.isVisible,
      },
    });
  },
  deleteOwned(id: string, profileId: string) {
    return prisma.education.deleteMany({ where: { id, profileId } });
  },
};

export const projectsRepo = {
  list(profileId: string) {
    return prisma.project.findMany({
      where: { profileId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  },
  findOwned(id: string, profileId: string) {
    return prisma.project.findFirst({ where: { id, profileId }, select: { id: true } });
  },
  create(profileId: string, data: ProjectInput) {
    return prisma.project.create({
      data: {
        profileId,
        titleI18n: data.titleI18n,
        summaryI18n: data.summaryI18n,
        tags: data.tags,
        demoUrl: data.demoUrl || null,
        repoUrl: data.repoUrl || null,
        year: data.year ?? null,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
        isVisible: data.isVisible,
      },
    });
  },
  update(id: string, data: ProjectInput) {
    return prisma.project.update({
      where: { id },
      data: {
        titleI18n: data.titleI18n,
        summaryI18n: data.summaryI18n,
        tags: data.tags,
        demoUrl: data.demoUrl || null,
        repoUrl: data.repoUrl || null,
        year: data.year ?? null,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
        isVisible: data.isVisible,
      },
    });
  },
  deleteOwned(id: string, profileId: string) {
    return prisma.project.deleteMany({ where: { id, profileId } });
  },
};

export const skillsRepo = {
  list(profileId: string) {
    return prisma.skill.findMany({
      where: { profileId },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });
  },
  findOwned(id: string, profileId: string) {
    return prisma.skill.findFirst({ where: { id, profileId }, select: { id: true } });
  },
  create(profileId: string, data: SkillInput) {
    return prisma.skill.create({
      data: {
        profileId,
        name: data.name,
        category: data.category,
        level: data.level,
        years: data.years ?? null,
        sortOrder: data.sortOrder,
        isVisible: data.isVisible,
      },
    });
  },
  update(id: string, data: SkillInput) {
    return prisma.skill.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        level: data.level,
        years: data.years ?? null,
        sortOrder: data.sortOrder,
        isVisible: data.isVisible,
      },
    });
  },
  deleteOwned(id: string, profileId: string) {
    return prisma.skill.deleteMany({ where: { id, profileId } });
  },
};
