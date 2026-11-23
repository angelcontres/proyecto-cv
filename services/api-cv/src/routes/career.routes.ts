import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import { requireAuthenticatedContext } from "@cv/api-auth";
import { notFoundResponse, parseAndValidate } from "@cv/core";
import {
  educationsRepo,
  experiencesRepo,
  projectsRepo,
  skillsRepo,
} from "../repositories/career.repository";
import {
  educationSchema,
  experienceSchema,
  projectSchema,
  skillSchema,
} from "../schemas/career.schema";

interface CareerRepository<TInput> {
  list(profileId: string): Promise<unknown[]>;
  findOwned(id: string, profileId: string): Promise<{ id: string } | null>;
  create(profileId: string, data: TInput): Promise<unknown>;
  update(id: string, data: TInput): Promise<unknown>;
  deleteOwned(id: string, profileId: string): Promise<{ count: number }>;
}

/**
 * Genera manejadores REST homogéneos (GET/POST/PATCH/DELETE) para entidades de trayectoria.
 */
function createCareerCrudHandlers<TInput>(
  repo: CareerRepository<TInput>,
  schema: z.ZodType<TInput, z.ZodTypeDef, unknown>,
  notFoundMessage: string
) {
  return {
    async list() {
      const auth = await requireAuthenticatedContext();
      if (!auth.ok) return auth.response;
      const items = await repo.list(auth.ctx.profileId);
      return NextResponse.json({ items });
    },
    async create(request: NextRequest) {
      const auth = await requireAuthenticatedContext();
      if (!auth.ok) return auth.response;
      const parsed = await parseAndValidate(request, schema);
      if (!parsed.ok) return parsed.response;
      const item = await repo.create(auth.ctx.profileId, parsed.data);
      return NextResponse.json({ item }, { status: 201 });
    },
    async update(request: NextRequest, context: { params: Promise<{ id: string }> }) {
      const auth = await requireAuthenticatedContext();
      if (!auth.ok) return auth.response;
      const { id } = await context.params;
      const existing = await repo.findOwned(id, auth.ctx.profileId);
      if (!existing) return notFoundResponse(notFoundMessage);
      const parsed = await parseAndValidate(request, schema);
      if (!parsed.ok) return parsed.response;
      const item = await repo.update(id, parsed.data);
      return NextResponse.json({ item });
    },
    async remove(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
      const auth = await requireAuthenticatedContext();
      if (!auth.ok) return auth.response;
      const { id } = await context.params;
      const deleted = await repo.deleteOwned(id, auth.ctx.profileId);
      if (deleted.count === 0) return notFoundResponse(notFoundMessage);
      return NextResponse.json({ ok: true });
    },
  };
}

export const experienceHandlers = createCareerCrudHandlers(
  experiencesRepo,
  experienceSchema,
  "Experiencia no encontrada."
);
export const educationHandlers = createCareerCrudHandlers(
  educationsRepo,
  educationSchema,
  "Registro académico no encontrado."
);
export const projectHandlers = createCareerCrudHandlers(
  projectsRepo,
  projectSchema,
  "Proyecto no encontrado."
);
export const skillHandlers = createCareerCrudHandlers(
  skillsRepo,
  skillSchema,
  "Habilidad no encontrada."
);
