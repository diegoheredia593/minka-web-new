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
  | {
      ok: true;
      mode: "crm" | "forms" | "partial" | "ignored";
      contactId?: string;
      dealId?: string;
      pipelineId?: string;
      formAccepted?: boolean;
    }
  | {
      ok: false;
      mode: "error";
      message: string;
    };

type HubSpotObject = {
  id: string;
};

type HubSpotSearchResponse = {
  results?: HubSpotObject[];
};

type HubSpotPipeline = {
  id: string;
  label: string;
  stages?: Array<{
    id: string;
    label: string;
    displayOrder?: number;
  }>;
};

type HubSpotPipelineList = {
  results?: HubSpotPipeline[];
};

const FORM_PORTAL_ID = "51970751";
const FORM_ID = "d2cac2e3-232c-47f8-9f21-3856a09a2dfd";
const PIPELINE_LABEL = "Minka - Ventas";

const PIPELINE_STAGES = [
  { label: "Lead nuevo", probability: "0.1" },
  { label: "Contactado", probability: "0.25" },
  { label: "Demo agendada", probability: "0.45" },
  { label: "Piloto propuesto", probability: "0.7" },
  { label: "Cerrado ganado", probability: "1.0" },
  { label: "Cerrado perdido", probability: "0.0" },
];

class HubSpotRequestError extends Error {
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

function getCrmToken() {
  return (
    getEnvValue("HUBSPOT_PRIVATE_APP_TOKEN") ??
    getEnvValue("HUBSPOT_ACCESS_TOKEN")
  );
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

function compactProperties(properties: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => clean(value) !== undefined),
  ) as Record<string, string>;
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

async function hubspotRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`https://api.hubapi.com${path}`, {
    ...init,
    headers,
  });
  const body = await readJson(response);

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : "HubSpot request failed";
    throw new HubSpotRequestError(response.status, message);
  }

  return body as T;
}

async function submitHubSpotForm(payload: DemoRequestPayload) {
  const fieldSets = [
    [
      { name: "firstname", value: clean(payload.name) ?? "" },
      { name: "email", value: clean(payload.email) ?? "" },
      { name: "phone", value: clean(payload.phone) ?? "" },
      { name: "numero_de_unidades", value: clean(payload.units) ?? "" },
      { name: "nombre_de_la_comunidad", value: clean(payload.community) ?? "" },
      { name: "necesidad_principal", value: clean(payload.message) ?? "" },
    ],
    [
      { name: "firstname", value: clean(payload.name) ?? "" },
      { name: "email", value: clean(payload.email) ?? "" },
      { name: "whatsapp", value: clean(payload.phone) ?? "" },
      { name: "unidades", value: clean(payload.units) ?? "" },
      { name: "comunidad", value: clean(payload.community) ?? "" },
      { name: "que_te_gustaria_ordenar_primero", value: clean(payload.message) ?? "" },
    ],
    [
      { name: "firstname", value: clean(payload.name) ?? "" },
      { name: "email", value: clean(payload.email) ?? "" },
      { name: "phone", value: clean(payload.phone) ?? "" },
      { name: "units", value: clean(payload.units) ?? "" },
      { name: "community", value: clean(payload.community) ?? "" },
      { name: "message", value: clean(payload.message) ?? "" },
    ],
    [
      { name: "firstname", value: clean(payload.name) ?? "" },
      { name: "email", value: clean(payload.email) ?? "" },
      { name: "phone", value: clean(payload.phone) ?? "" },
    ],
    [
      { name: "firstname", value: clean(payload.name) ?? "" },
      { name: "email", value: clean(payload.email) ?? "" },
      { name: "phone", value: clean(payload.phone) ?? "" },
      { name: "message", value: buildFallbackMessage(payload) },
    ],
  ].map((fields) => fields.filter((field) => field.value.trim().length > 0));

  let acceptedFallback = false;

  for (const fields of fieldSets) {
    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${FORM_PORTAL_ID}/${FORM_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submittedAt: String(Date.now()),
          fields,
          context: {
            pageName: payload.pageName ?? "Minka",
            pageUri: payload.pageUri ?? "https://minka-landing.herediadiego963.chatgpt.site/",
          },
        }),
      },
    );

    if (response.ok) {
      return { ok: true, partial: acceptedFallback };
    }

    if (response.status !== 400) {
      return { ok: false };
    }

    acceptedFallback = true;
  }

  return { ok: false };
}

function buildFallbackMessage(payload: DemoRequestPayload) {
  const lines = [
    clean(payload.message),
    clean(payload.units) ? `Unidades: ${clean(payload.units)}` : undefined,
    clean(payload.community) ? `Comunidad: ${clean(payload.community)}` : undefined,
  ].filter(Boolean);

  return lines.join("\n\n") || "Solicitud de demo desde minka.app";
}

async function ensureSalesPipeline(token: string) {
  const configuredPipelineId = clean(getEnvValue("HUBSPOT_PIPELINE_ID"));
  const configuredStageId = clean(getEnvValue("HUBSPOT_INITIAL_STAGE_ID"));

  if (configuredPipelineId && configuredStageId) {
    return { pipelineId: configuredPipelineId, stageId: configuredStageId };
  }

  const pipelines = await hubspotRequest<HubSpotPipelineList>(
    "/crm/v3/pipelines/deals",
    token,
  );
  const existing = pipelines.results?.find(
    (pipeline) =>
      pipeline.label === PIPELINE_LABEL || pipeline.id === configuredPipelineId,
  );

  if (existing) {
    const firstStage = getFirstStage(existing);
    if (firstStage || configuredStageId) {
      return {
        pipelineId: existing.id,
        stageId: configuredStageId ?? firstStage,
      };
    }
  }

  const created = await hubspotRequest<HubSpotPipeline>(
    "/crm/v3/pipelines/deals",
    token,
    {
      method: "POST",
      body: JSON.stringify({
        label: PIPELINE_LABEL,
        displayOrder: 0,
        stages: PIPELINE_STAGES.map((stage, index) => ({
          label: stage.label,
          displayOrder: index,
          metadata: {
            probability: stage.probability,
          },
        })),
      }),
    },
  );
  const firstStage = getFirstStage(created);

  if (!firstStage) {
    throw new Error("HubSpot did not return a first deal stage.");
  }

  return { pipelineId: created.id, stageId: firstStage };
}

function getFirstStage(pipeline: HubSpotPipeline) {
  return pipeline.stages
    ?.slice()
    .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
    .at(0)?.id;
}

async function findContactByEmail(email: string, token: string) {
  const search = await hubspotRequest<HubSpotSearchResponse>(
    "/crm/v3/objects/contacts/search",
    token,
    {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: email,
              },
            ],
          },
        ],
        properties: ["email"],
        limit: 1,
      }),
    },
  );

  return search.results?.[0]?.id;
}

async function upsertContact(payload: DemoRequestPayload, token: string) {
  const email = clean(payload.email);
  if (!email) {
    throw new Error("Email is required to create a HubSpot contact.");
  }

  const { firstName, lastName } = splitName(payload.name);
  const properties = compactProperties({
    email,
    firstname: firstName,
    lastname: lastName,
    phone: clean(payload.phone),
    company: clean(payload.community),
  });
  const existingContactId = await findContactByEmail(email, token);

  if (existingContactId) {
    const updated = await hubspotRequest<HubSpotObject>(
      `/crm/v3/objects/contacts/${existingContactId}`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      },
    );
    return updated.id;
  }

  const created = await hubspotRequest<HubSpotObject>(
    "/crm/v3/objects/contacts",
    token,
    {
      method: "POST",
      body: JSON.stringify({ properties }),
    },
  );
  return created.id;
}

async function createDeal(
  payload: DemoRequestPayload,
  token: string,
  pipelineId: string,
  stageId: string,
) {
  const requester = clean(payload.name) ?? clean(payload.email) ?? "Lead";
  const community = clean(payload.community) ?? "Comunidad sin nombre";
  const created = await hubspotRequest<HubSpotObject>(
    "/crm/v3/objects/deals",
    token,
    {
      method: "POST",
      body: JSON.stringify({
        properties: {
          dealname: `Demo Minka - ${community} - ${requester}`,
          pipeline: pipelineId,
          dealstage: stageId,
        },
      }),
    },
  );

  return created.id;
}

async function associateDealWithContact(
  dealId: string,
  contactId: string,
  token: string,
) {
  await hubspotRequest(
    `/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`,
    token,
    { method: "PUT" },
  );
}

async function createCrmLead(payload: DemoRequestPayload, token: string) {
  const { pipelineId, stageId } = await ensureSalesPipeline(token);
  const contactId = await upsertContact(payload, token);
  const dealId = await createDeal(payload, token, pipelineId, stageId);

  try {
    await associateDealWithContact(dealId, contactId, token);
  } catch {
    // Deal/contact creation is still useful if the default association is unavailable.
  }

  return { contactId, dealId, pipelineId };
}

export async function handleDemoRequest(
  payload: DemoRequestPayload,
): Promise<DemoRequestResult> {
  if (clean(payload.website)) {
    return { ok: true, mode: "ignored" };
  }

  const token = getCrmToken();
  const formSubmission = await submitHubSpotForm(payload);

  if (!token) {
    if (formSubmission.ok) {
      return {
        ok: true,
        mode: formSubmission.partial ? "partial" : "forms",
        formAccepted: true,
      };
    }

    return {
      ok: false,
      mode: "error",
      message: "No se pudo registrar la solicitud en HubSpot.",
    };
  }

  try {
    const crmLead = await createCrmLead(payload, token);
    return {
      ok: true,
      mode: "crm",
      ...crmLead,
      formAccepted: formSubmission.ok,
    };
  } catch (error) {
    if (formSubmission.ok) {
      return {
        ok: true,
        mode: formSubmission.partial ? "partial" : "forms",
        formAccepted: true,
      };
    }

    if (error instanceof HubSpotRequestError) {
      return {
        ok: false,
        mode: "error",
        message: `HubSpot respondio con error ${error.status}: ${error.message}`,
      };
    }

    return {
      ok: false,
      mode: "error",
      message: "No se pudo crear el lead en HubSpot.",
    };
  }
}
