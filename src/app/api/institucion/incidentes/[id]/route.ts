import {
  autenticarInstitucional,
  registrarConsultaAuditoria,
} from "@/lib/auth/institucion";
import { jsonError, jsonOk } from "@/lib/auth/session";
import { createAdminServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface IncidenteResuelto {
  estado: string;
  id: string;
  resuelto_en: string | null;
  timestamp: string;
  tipo: string;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const acceso = await autenticarInstitucional(req);
  if (!acceso.ok) {
    return acceso.response;
  }

  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return jsonError("El identificador del incidente no es válido.", 400);
  }

  const admin = createAdminServerClient();
  const resueltoEn = new Date().toISOString();

  const { data, error } = await admin
    .from("incidentes")
    .update({ estado: "resuelto", resuelto_en: resueltoEn })
    .eq("id", id)
    .eq("estado", "en_curso")
    .select("id, tipo, estado, timestamp, resuelto_en")
    .maybeSingle()
    .overrideTypes<IncidenteResuelto | null>();

  if (error) {
    return jsonError(error.message, 500, error.code);
  }

  if (!data) {
    const { data: actual, error: actualError } = await admin
      .from("incidentes")
      .select("id, estado")
      .eq("id", id)
      .maybeSingle()
      .overrideTypes<{ estado: string; id: string } | null>();

    if (actualError) {
      return jsonError(actualError.message, 500, actualError.code);
    }
    if (!actual) {
      return jsonError("Incidente no encontrado.", 404);
    }
    return jsonError(
      `Solo se puede resolver un incidente en curso (estado actual: ${actual.estado}).`,
      409,
    );
  }

  await registrarConsultaAuditoria({
    accion: "resolver_incidente",
    detalles: {
      estado_anterior: "en_curso",
      estado_nuevo: "resuelto",
      incidente_id: data.id,
      resuelto_en: data.resuelto_en,
    },
    institucionId: acceso.institucionId,
    userId: acceso.user.id,
  });

  return jsonOk({ incidente: data });
}
