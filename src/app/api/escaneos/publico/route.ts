import { createHash } from "node:crypto";

import { parseJsonBody } from "@/lib/api/http";
import { ipDeRequest } from "@/lib/auth/actividad-servidor";
import { jsonError, jsonOk } from "@/lib/auth/session";
import { createAnonServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SLUG_REGEX = /^[abcdefghjkmnpqrstuvwxyz23456789]{10,32}$/;
const IP_SALT = process.env.ESCANEO_IP_SALT?.trim() || "ayudapi-escaneos-v1";

interface EscaneoPublicoRequest {
  slug?: string;
}

interface EscaneoPublicoResultado {
  escaneo_id?: string;
  motivo?: string;
  registrado?: boolean;
}

function hashIp(req: Request): string | null {
  const ip = ipDeRequest(req);
  if (!ip) {
    return null;
  }
  return createHash("sha256").update(`${IP_SALT}:${ip}`).digest("hex");
}

export async function POST(req: Request) {
  const parsed = await parseJsonBody<EscaneoPublicoRequest>(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  const slug = parsed.data.slug?.trim();
  if (!slug || !SLUG_REGEX.test(slug)) {
    return jsonError("Slug de emergencia inválido.", 400);
  }

  const { data, error } = await createAnonServerClient().rpc(
    "registrar_escaneo_publico",
    { p_ip_hash: hashIp(req), p_slug: slug },
  );

  if (error) {
    return jsonError("No se pudo registrar el escaneo.", 500, error.message);
  }

  const resultado = (data ?? {}) as EscaneoPublicoResultado;

  return jsonOk({
    registrado: resultado.registrado === true,
    ...(resultado.motivo ? { motivo: resultado.motivo } : {}),
  });
}
