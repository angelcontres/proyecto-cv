import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedContext } from "@cv/api-auth";
import { parseAndValidate } from "@cv/core";
import {
  findProfileById,
  findSlugConflict,
  updateProfileById,
} from "../repositories/profile.repository";
import { profileUpdateSchema } from "../schemas/profile.schema";

export async function handleGetProfile() {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) return auth.response;

  const profile = await findProfileById(auth.ctx.profileId);
  return NextResponse.json({ profile });
}

export async function handleUpdateProfile(request: NextRequest) {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) return auth.response;

  const parsed = await parseAndValidate(request, profileUpdateSchema);
  if (!parsed.ok) return parsed.response;

  const conflict = await findSlugConflict(parsed.data.slug, auth.ctx.profileId);
  if (conflict) {
    return NextResponse.json({ error: "El slug público ya está en uso." }, { status: 409 });
  }

  const updated = await updateProfileById(auth.ctx.profileId, parsed.data);
  return NextResponse.json({ profile: updated });
}
