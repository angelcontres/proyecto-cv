import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedContext } from "@cv/api-auth";
import { parseAndValidate } from "@cv/core";
import type { Prisma } from "@cv/database";
import { createStarterCanvasSchema } from "../engine/defaults";
import {
  getLayoutStateByProfile,
  saveDraftAndMaybePublish,
} from "../repositories/layout.repository";
import { layoutSaveSchema } from "../schemas/canvas.schema";

export async function handleGetLayout() {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) return auth.response;

  const { draft, published, history } = await getLayoutStateByProfile(auth.ctx.profileId);

  return NextResponse.json({
    draft: draft ?? { status: "DRAFT", version: 1, canvasSchema: createStarterCanvasSchema() },
    published,
    history,
  });
}

export async function handleSaveLayout(request: NextRequest) {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) return auth.response;

  const parsed = await parseAndValidate(request, layoutSaveSchema);
  if (!parsed.ok) return parsed.response;

  const { canvasSchema, publish } = parsed.data;
  const serializedCanvas = canvasSchema as unknown as Prisma.InputJsonValue;

  const result = await saveDraftAndMaybePublish({
    profileId: auth.ctx.profileId,
    serializedCanvas,
    publish,
  });

  return NextResponse.json(result);
}
