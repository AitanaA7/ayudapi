import { autenticarInstitucional } from "@/lib/auth/institucion";
import { jsonError, jsonOk } from "@/lib/auth/session";
import { createAdminServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ESTADOS_VALIDOS = new Set(["cancelado", "en_curso", "enviado", "resuelto"]);
const ESTADOS_ACTIVOS = ["enviado", "en_curso"] as const;
const LIMITE = 100;

interface IncidenteListado {
  estado: string;
  id: string;
  lat: number | null;
  lng: number | null;
  timestamp: string;
  tipo: string;
}

export async function GET(req: Request) {
  const acceso = await autenticarInstitucional(req);
  if (!acceso.ok) {
    return acceso.response;
  }

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get("estado") ?? "en_curso";
  if (estado !== "todos" && !ESTADOS_VALIDOS.has(estado)) {
    return jsonError("El parámetro 'estado' no es válido.", 400);
  }

  let query = createAdminServerClient()
    .from("incidentes")
    .select("id, tipo, estado, timestamp, lat, lng")
    .order("timestamp", { ascending: false })
    .limit(LIMITE);

  if (estado === "en_curso") {
    query = query.in("estado", [...ESTADOS_ACTIVOS]);
  } else if (estado !== "todos") {
    query = query.eq("estado", estado);
  }

  const { data, error } = await query.overrideTypes<IncidenteListado[]>();
  if (error) {
    return jsonError(error.message, 500, error.code);
  }

  return jsonOk({ incidentes: data ?? [] });
}
