import { handleDemoRequest, type DemoRequestPayload } from "@/lib/hubspot";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request: Request) {
  let payload: DemoRequestPayload;

  try {
    payload = (await request.json()) as DemoRequestPayload;
  } catch {
    return json(
      { ok: false, message: "La solicitud no tiene un formato valido." },
      400,
    );
  }

  if (!payload.name?.trim() || !payload.email?.trim()) {
    return json(
      { ok: false, message: "Nombre y correo son obligatorios." },
      400,
    );
  }

  const result = await handleDemoRequest(payload);
  return json(result, result.ok ? 200 : 502);
}
