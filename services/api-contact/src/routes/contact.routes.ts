import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedContext } from "@cv/api-auth";
import { checkRateLimit, getClientIp, notFoundResponse, parseAndValidate } from "@cv/core";
import {
  createContactMessage,
  deleteMessageForProfile,
  findPrimaryProfileForContact,
  listMessagesByProfile,
  updateMessageReadState,
} from "../repositories/contact.repository";
import { contactMessageSchema, markReadSchema } from "../schemas/contact.schema";

const CONTACT_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_MAX_REQUESTS = 5;

export async function handleSubmitPublicContact(request: NextRequest) {
  const rateKey = `contact:${getClientIp(request)}`;
  const rateCheck = checkRateLimit(rateKey, CONTACT_MAX_REQUESTS, CONTACT_WINDOW_MS);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Has enviado demasiados mensajes seguidos. Intenta nuevamente en unos minutos." },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds) } }
    );
  }

  const parsed = await parseAndValidate(request, contactMessageSchema);
  if (!parsed.ok) return parsed.response;

  const data = parsed.data;
  if ((data.websiteHoneypot ?? "").trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const primaryProfile = await findPrimaryProfileForContact();
  if (!primaryProfile) {
    return NextResponse.json({ error: "No hay un perfil activo configurado." }, { status: 404 });
  }

  await createContactMessage(primaryProfile.id, data);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function handleListMessages() {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) return auth.response;

  const items = await listMessagesByProfile(auth.ctx.profileId);
  return NextResponse.json({ items });
}

export async function handleMarkMessageRead(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const parsed = await parseAndValidate(request, markReadSchema);
  if (!parsed.ok) return parsed.response;

  const updated = await updateMessageReadState(id, auth.ctx.profileId, parsed.data.isRead);
  if (updated.count === 0) return notFoundResponse("Mensaje no encontrado.");
  return NextResponse.json({ ok: true });
}

export async function handleDeleteMessage(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const deleted = await deleteMessageForProfile(id, auth.ctx.profileId);
  if (deleted.count === 0) return notFoundResponse("Mensaje no encontrado.");
  return NextResponse.json({ ok: true });
}
