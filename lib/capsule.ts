import { env as workerEnv } from "cloudflare:workers";

export type DemoRequestPayload = {
  name?: string;
  email?: string;
  phone?: string;
  units?: string;
  community?: string;
  message?: string;
  timeline?: string;
  currentTool?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  website?: string;
  pageName?: string;
  pageUri?: string;
};

type DemoRequestResult =
  | { ok: true; mode: "ignored" }
  | { ok: true; mode: "crm"; contactId: string; noteCreated: boolean }
  | { ok: false; mode: "error"; message: string };

type CapsuleEmailAddress = { address?: string };
type CapsuleTag = { id?: number; name?: string; _delete?: boolean };
type CapsuleParty = {
  id: number;
  type?: string;
  emailAddresses?: CapsuleEmailAddress[];
  tags?: CapsuleTag[];
};
type CapsulePartySearchResponse = { parties?: CapsuleParty[] };
type CapsulePartyResponse = { party: CapsuleParty };

// The three score tags this integration manages. Kept as plain text (no
// emoji) so they sort predictably and filter reliably in Capsule's UI.
const SCORE_TAG_NAMES = ["Lead caliente", "Lead tibio", "Lead frío"] as const;
type ScoreTagName = (typeof SCORE_TAG_NAMES)[number];

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

function parseUnits(value?: string) {
  const match = clean(value)?.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

const TIMELINE_SCORES: Record<string, { points: number; label: string }> = {
  ya: { points: 30, label: "quiere empezar lo antes posible" },
  mes: { points: 20, label: "quiere empezar este mes" },
  explorando: { points: 5, label: "todavía está explorando opciones" },
};

const CURRENT_TOOL_SCORES: Record<string, { points: number; label: string }> = {
  nada: { points: 15, label: "no usa ninguna herramienta hoy (caos total)" },
  "whatsapp-excel": { points: 10, label: "gestiona hoy con WhatsApp/Excel" },
  "otro-software": { points: 5, label: "ya usa otro software" },
};

const REFERRAL_SOURCES = new Set(["referral", "referido", "whatsapp", "word-of-mouth"]);

// A simple, transparent point system built only from what the form already
// captures (plus the two new qualifying questions and UTM). No external
// scoring service, no black box: every point is explained in `reasons` so
// it can be read straight off the note in Capsule.
function computeScore(payload: DemoRequestPayload) {
  let score = 0;
  const reasons: string[] = [];

  const units = parseUnits(payload.units);
  if (units !== undefined) {
    if (units >= 50) {
      score += 30;
    } else if (units >= 20) {
      score += 20;
    } else if (units >= 5) {
      score += 10;
    } else {
      score += 5;
    }
    reasons.push(`${units} unidades`);
  }

  if (clean(payload.phone)) {
    score += 10;
    reasons.push("dejó teléfono");
  }

  const message = clean(payload.message);
  if (message) {
    score += message.length > 40 ? 10 : 5;
    reasons.push(message.length > 40 ? "mensaje detallado" : "dejó un mensaje");
  }

  const timeline = payload.timeline ? TIMELINE_SCORES[payload.timeline] : undefined;
  if (timeline) {
    score += timeline.points;
    reasons.push(timeline.label);
  }

  const currentTool = payload.currentTool ? CURRENT_TOOL_SCORES[payload.currentTool] : undefined;
  if (currentTool) {
    score += currentTool.points;
    reasons.push(currentTool.label);
  }

  const source = clean(payload.utmSource)?.toLowerCase();
  if (source && REFERRAL_SOURCES.has(source)) {
    score += 5;
    reasons.push("llegó por referido");
  }

  const tag: ScoreTagName = score >= 60 ? "Lead caliente" : score >= 30 ? "Lead tibio" : "Lead frío";

  return { score, tag, reasons };
}

function buildAbout(payload: DemoRequestPayload, score: ReturnType<typeof computeScore>) {
  const lines = [
    clean(payload.community) ? `Comunidad: ${clean(payload.community)}` : undefined,
    clean(payload.units) ? `Unidades: ${clean(payload.units)}` : undefined,
    `${score.tag} (${score.score}/100)`,
  ].filter((line): line is string => Boolean(line));

  return lines.join(" · ") || undefined;
}

function buildNoteContent(payload: DemoRequestPayload, score: ReturnType<typeof computeScore>) {
  const utm = [
    clean(payload.utmSource) ? `fuente=${clean(payload.utmSource)}` : undefined,
    clean(payload.utmMedium) ? `medio=${clean(payload.utmMedium)}` : undefined,
    clean(payload.utmCampaign) ? `campaña=${clean(payload.utmCampaign)}` : undefined,
  ].filter((line): line is string => Boolean(line));

  const lines = [
    clean(payload.message) ? `Mensaje: ${clean(payload.message)}` : undefined,
    clean(payload.units) ? `Unidades: ${clean(payload.units)}` : undefined,
    clean(payload.community) ? `Comunidad: ${clean(payload.community)}` : undefined,
    payload.timeline ? `Cuándo quiere empezar: ${TIMELINE_SCORES[payload.timeline]?.label ?? payload.timeline}` : undefined,
    payload.currentTool
      ? `Cómo gestiona hoy: ${CURRENT_TOOL_SCORES[payload.currentTool]?.label ?? payload.currentTool}`
      : undefined,
    utm.length > 0 ? `UTM: ${utm.join(", ")}` : undefined,
    `Calificación: ${score.score}/100 — ${score.tag}${score.reasons.length > 0 ? ` (${score.reasons.join(", ")})` : ""}`,
    `Origen: ${payload.pageName ?? "Minka"} (${payload.pageUri ?? "https://appminka.com/"})`,
  ].filter((line): line is string => Boolean(line));

  return lines.join("\n") || "Solicitud de demo desde appminka.com";
}

// Clears out any of OUR score tags the party already carries (by id +
// _delete) and adds the current one by name, so a returning lead's tag
// reflects their latest score instead of accumulating every tag it has
// ever earned. Tags Diego added by hand in Capsule are left untouched.
async function replaceScoreTag(
  partyId: number,
  nextTag: ScoreTagName,
  token: string,
) {
  let existingTags: CapsuleTag[] = [];
  try {
    const current = await capsuleRequest<CapsulePartyResponse>(
      `/parties/${partyId}?embed=tags`,
      token,
    );
    existingTags = current.party.tags ?? [];
  } catch {
    // If we can't read current tags, still try to add the new one below
    // rather than failing the whole submission over a cosmetic detail.
  }

  const staleScoreTags = existingTags
    .filter(
      (tag) =>
        tag.id !== undefined &&
        tag.name &&
        (SCORE_TAG_NAMES as readonly string[]).includes(tag.name) &&
        tag.name !== nextTag,
    )
    .map((tag) => ({ id: tag.id, _delete: true as const }));

  const alreadyHasTag = existingTags.some((tag) => tag.name === nextTag);
  const tags = [...staleScoreTags, ...(alreadyHasTag ? [] : [{ name: nextTag }])];

  if (tags.length === 0) {
    return;
  }

  await capsuleRequest(`/parties/${partyId}`, token, {
    method: "PUT",
    body: JSON.stringify({ party: { tags } }),
  });
}

async function upsertParty(payload: DemoRequestPayload, token: string) {
  const email = clean(payload.email);
  if (!email) {
    throw new Error("El correo es obligatorio para crear un contacto en Capsule.");
  }

  const { firstName, lastName } = splitName(payload.name);
  const phone = clean(payload.phone);
  const score = computeScore(payload);
  const about = buildAbout(payload, score);

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
    await replaceScoreTag(updated.party.id, score.tag, token);
    return { id: updated.party.id, score };
  }

  const created = await capsuleRequest<CapsulePartyResponse>(
    "/parties",
    token,
    {
      method: "POST",
      body: JSON.stringify({ party: { ...partyBody, tags: [{ name: score.tag }] } }),
    },
  );
  return { id: created.party.id, score };
}

async function addNote(
  partyId: number,
  payload: DemoRequestPayload,
  score: ReturnType<typeof computeScore>,
  token: string,
) {
  await capsuleRequest("/entries", token, {
    method: "POST",
    body: JSON.stringify({
      entry: {
        type: "note",
        party: { id: partyId },
        content: buildNoteContent(payload, score),
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
    const { id: contactId, score } = await upsertParty(payload, token);

    let noteCreated = true;
    try {
      await addNote(contactId, payload, score, token);
    } catch {
      // The contact is still useful even if the note (mensaje, unidades,
      // comunidad, origen, calificación) couldn't be attached for some reason.
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
