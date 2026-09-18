import { env as workerEnv } from "cloudflare:workers";

export type DemoRequestPayload = {
  name?: string;
  email?: string;
  phone?: string;
  units?: string;
  community?: string;
  message?: string;
  website?: string;
  pageName?: string;
  pageUri?: string;
};

type DemoRequestResult =
  | { ok: true; mode: "ignored" }
  | { ok: true; mode: "crm"; contactId: string; noteCreated: boolean }
  | { ok: false; mode: "error"; message: string };

type CapsuleEmailAddress = { address?: string };
type CapsuleParty = {
  id: number;
  type?: string;
  emailAddresses?: CapsuleEmailAddress[];
};
type CapsulePartySearchResponse = { parties?: CapsuleParty[] };
type CapsulePartyResponse = { party: CapsuleParty };

const API_BASE = "https://api.capsulecrm.com/api/v2";

class CapsuleRequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function getEnvValue(key: string) {
  const envRecord = workerEnv as Record<string, string | undefined>;
  return envRecord[key] ?? process.env[key];
}

function getCapsuleToken() {
  return getEnvValue("CAPSULE_API_TOKEN");
}

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function splitName(fullName?: string) {
  const parts = clean(fullName)?.split(/\s+/) ?? [];
  const firstName = parts.shift();
  const lastName = parts.join(" ") || undefined;
  return { firstName, lastName };
}

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function capsuleRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const body = await readJson(response);

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof (body as { message?: unknown }).message === "string"
        ? (body as { message: string }).message
        : `Capsule respondió con error ${response.status}`;
    throw new CapsuleRequestError(response.status, message);
  }

  return body as T;
}

// Capsule doesn't have a dedicated "find by email" filter, so this reuses
// the general search endpoint and confirms the match client-side. If the
// search fails or comes back ambiguous, we fall through to creating a new
// party rather than blocking the whole submission on a lookup problem.
async function findPartyByEmail(email: string, token: string) {
  try {
    const result = await capsuleRequest<CapsulePartySearchResponse>(
      `/parties/search?q=${encodeURIComponent(email)}`,
      token,
    );
    const normalized = email.toLowerCase();
    const exactMatch = result.parties?.find((party) =>
      party.emailAddresses?.some(
        (entry) => entry.address?.toLowerCase() === normalized,
      ),
    );
    return exactMatch?.id;
  } catch {
    return undefined;
  }
}

function buildAbout(payload: DemoRequestPayload) {
  const lines = [
    clean(payload.community) ? `Comunidad: ${clean(payload.community)}` : undefined,
    clean(payload.units) ? `Unidades: ${clean(payload.units)}` : undefined,
  ].filter((line): line is string => Boolean(line));

  return lines.join(" · ") || undefined;
}

function buildNoteContent(payload: DemoRequestPayload) {
  const lines = [
    clean(payload.message) ? `Mensaje: ${clean(payload.message)}` : undefined,
    clean(payload.units) ? `Unidades: ${clean(payload.units)}` : undefined,
    clean(payload.community) ? `Comunidad: ${clean(payload.community)}` : undefined,
    `Origen: ${payload.pageName ?? "Minka"} (${payload.pageUri ?? "https://appminka.com/"})`,
  ].filter((line): line is string => Boolean(line));

  return lines.join("\n") || "Solicitud de demo desde appminka.com";
}

async function upsertParty(payload: DemoRequestPayload, token: string) {
  const email = clean(payload.email);
  if (!email) {
    throw new Error("El correo es obligatorio para crear un contacto en Capsule.");
  }

  const { firstName, lastName } = splitName(payload.name);
  const phone = clean(payload.phone);
  const about = buildAbout(payload);

  const partyBody: Record<string, unknown> = {
    type: "person",
    firstName: firstName ?? email,
    lastName,
    emailAddresses: [{ type: "Work", address: email }],
  };
  if (phone) {
    partyBody.phoneNumbers = [{ type: "Work", number: phone }];
  }
  if (about) {
    partyBody.about = about;
  }

  const existingId = await findPartyByEmail(email, token);

  if (existingId) {
    const updated = await capsuleRequest<CapsulePartyResponse>(
      `/parties/${existingId}`,
      token,
      { method: "PUT", body: JSON.stringify({ party: partyBody }) },
    );
    return updated.party.id;
  }

  const created = await capsuleRequest<CapsulePartyResponse>(
    "/parties",
    token,
    { method: "POST", body: JSON.stringify({ party: partyBody }) },
  );
  return created.party.id;
}

async function addNote(partyId: number, payload: DemoRequestPayload, token: string) {
  await capsuleRequest("/entries", token, {
    method: "POST",
    body: JSON.stringify({
      entry: {
        type: "note",
        party: { id: partyId },
        content: buildNoteContent(payload),
      },
    }),
  });
}

export async function handleDemoRequest(
  payload: DemoRequestPayload,
): Promise<DemoRequestResult> {
  if (clean(payload.website)) {
    return { ok: true, mode: "ignored" };
  }

  const token = getCapsuleToken();
  if (!token) {
    return {
      ok: false,
      mode: "error",
      message:
        "Capsule no está configurado: falta el secreto CAPSULE_API_TOKEN en Cloudflare.",
    };
  }

  try {
    const contactId = await upsertParty(payload, token);

    let noteCreated = true;
    try {
      await addNote(contactId, payload, token);
    } catch {
      // The contact is still useful even if the note (mensaje, unidades,
      // comunidad, origen) couldn't be attached for some reason.
      noteCreated = false;
    }

    return { ok: true, mode: "crm", contactId: String(contactId), noteCreated };
  } catch (error) {
    if (error instanceof CapsuleRequestError) {
      return {
        ok: false,
        mode: "error",
        message: `Capsule respondió con error ${error.status}: ${error.message}`,
      };
    }

    return {
      ok: false,
      mode: "error",
      message: "No se pudo crear el contacto en Capsule.",
    };
  }
}
