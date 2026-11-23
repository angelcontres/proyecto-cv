import bcrypt from "bcryptjs";
import { createStarterCanvasSchema } from "../../../services/api-studio/src/index";
import { prisma, type Prisma } from "../src/index";

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@proyecto-cv.local").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "AdminPassword123!";
  const name = process.env.SEED_ADMIN_NAME || "Propietario CV";
  const slug = process.env.PRIMARY_PROFILE_SLUG || "mi-cv";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name,
      role: "OWNER",
    },
  });

  const existingProfile = await prisma.profile.findFirst({
    where: { userId: user.id },
  });

  if (!existingProfile) {
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        slug,
        isPrimary: true,
        defaultLocale: "es",
        localizedInfo: {
          fullName: name,
          headline: {
            es: "Ingeniero de Software Full-Stack",
            en: "Full-Stack Software Engineer",
          },
          bio: {
            es: "Construyendo soluciones web escalables, interactivas y centradas en el usuario.",
            en: "Building scalable, interactive, user-centered web solutions.",
          },
          location: "Ciudad de México / Remoto",
          availabilityBadge: {
            es: "Disponible para nuevos retos",
            en: "Open to new opportunities",
          },
          publicEmail: email,
        },
        socialLinks: {
          linkedin: "",
          github: "",
          website: "",
          x: "",
        },
        themeConfig: {
          preset: "ryoku-obsidian",
          light: { primary: "#171513", accent: "#ce5e32", background: "#f3efe9", surface: "#faf8f4" },
          dark: { primary: "#cdc4ba", accent: "#ce5e32", background: "#000000", surface: "#0a0a0a" },
        },
      },
    });

    const starterCanvas = createStarterCanvasSchema();
    await prisma.pageLayout.create({
      data: {
        profileId: profile.id,
        status: "DRAFT",
        version: 1,
        canvasSchema: starterCanvas as unknown as Prisma.InputJsonValue,
      },
    });
  }

  console.log(`Seed completado para propietario: ${email} (slug: ${slug})`);
}

main()
  .catch((err) => {
    console.error("Error ejecutando seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
